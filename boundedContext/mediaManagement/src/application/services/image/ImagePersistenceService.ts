import { DataPersistenceError } from '@hatsuportal/platform'
import { Base64Image, CurrentImage, Image, StagedImage } from '../../../domain'
import { IImageRepository, StagedImageVersionIdentifier } from '../../repositories/IImageRepository'
import IImageFileService from '../IImageFileService'
import { Logger } from '@hatsuportal/common'
import { NonEmptyString } from '@hatsuportal/shared-kernel'
import { IImageApplicationMapper } from '../../mappers/ImageApplicationMapper'
import { IImageStorageService } from '../IImageStorageService'

const logger = new Logger('ImagePersistenceService')

export interface IImagePersistenceService {
  persistStaged(stagedImage: StagedImage): Promise<StagedImageVersionIdentifier>
  persistCurrent(image: CurrentImage): Promise<Image>
  discardStaged({ imageId, stagedVersionId }: StagedImageVersionIdentifier): Promise<void>
  update(image: CurrentImage): Promise<Image>
  delete(image: Image): Promise<void>
}

export class ImagePersistenceService implements IImagePersistenceService {
  constructor(
    private readonly imageRepository: IImageRepository,
    private readonly imageFileService: IImageFileService,
    private readonly imageStorageService: IImageStorageService,
    private readonly imageApplicationMapper: IImageApplicationMapper,
    private readonly versionRetentionCount: number
  ) {}

  async persistStaged(stagedImage: StagedImage): Promise<StagedImageVersionIdentifier> {
    try {
      const resizedBuffer = await this.getResizedImageBuffer(stagedImage.base64)
      await this.imageFileService.validateMimeType(resizedBuffer, stagedImage.storageKey)

      let metadataInserted = false
      let fileWritten = false

      try {
        await this.imageRepository.insertStaged(stagedImage)
        metadataInserted = true
        await this.imageStorageService.storeImageBuffer(resizedBuffer, stagedImage.storageKey)
        fileWritten = true
      } catch (error) {
        logger.error(`Failed to persist staged image ${stagedImage.imageId.value}, rolling back...`, error)
        // delete the staged version row always
        try {
          if (metadataInserted) {
            await this.imageRepository.discardStagedVersion({ imageId: stagedImage.imageId, stagedVersionId: stagedImage.id })
          }
          if (fileWritten) {
            await this.imageStorageService.deleteImage(stagedImage.storageKey)
          }
        } catch (rollbackError) {
          logger.error(`Failed to rollback staged image ${stagedImage.imageId.value}`, rollbackError)
        }
        throw error
      }

      return { imageId: stagedImage.imageId, stagedVersionId: stagedImage.id }
    } catch (error) {
      logger.error(`Failed to persist staged image ${stagedImage.imageId.value}`, error)
      throw new DataPersistenceError(error)
    }
  }

  async persistCurrent(currentImage: CurrentImage): Promise<Image> {
    try {
      const resizedBuffer = await this.getResizedImageBuffer(currentImage.base64)
      await this.imageFileService.validateMimeType(resizedBuffer, currentImage.storageKey)

      let metadataInserted = false
      let fileWritten = false

      try {
        await this.imageRepository.insertCurrent(currentImage)
        metadataInserted = true
        await this.imageStorageService.storeImageBuffer(resizedBuffer, currentImage.storageKey)
        fileWritten = true
      } catch (error) {
        logger.error(`Failed to persist current image ${currentImage.id.value}, rolling back...`, error)
        // delete the current version row always
        try {
          if (metadataInserted) {
            await this.imageRepository.rollbackCurrentVersion(currentImage)
          }
          if (fileWritten) {
            await this.imageStorageService.deleteImage(currentImage.storageKey)
          }
        } catch (rollbackError) {
          logger.error(`Failed to rollback current image ${currentImage.id.value}`, rollbackError)
        }
        throw error
      }

      const imageMetadata = await this.imageRepository.findByIdAndVersionId(currentImage.id, currentImage.currentVersionId)
      if (!imageMetadata) {
        throw new DataPersistenceError('Failed to retrieve persisted image')
      }

      return this.imageApplicationMapper.toDomainEntity(imageMetadata, currentImage.base64.value)
    } catch (error) {
      logger.error(`Failed to persist current image ${currentImage.id.value}`, error)
      throw new DataPersistenceError(error)
    }
  }

  async discardStaged({ imageId, stagedVersionId }: StagedImageVersionIdentifier): Promise<void> {
    try {
      const discardedVersion = await this.imageRepository.discardStagedVersion({ imageId, stagedVersionId })
      await this.imageStorageService.deleteImage(new NonEmptyString(discardedVersion.storageKey))
    } catch (error) {
      logger.error(`Failed to discard staged image ${imageId.value}`, error)
      throw new DataPersistenceError(error)
    }
  }

  async update(currentImage: CurrentImage): Promise<Image> {
    try {
      const resizedBuffer = await this.getResizedImageBuffer(currentImage.base64)
      await this.imageFileService.validateMimeType(resizedBuffer, currentImage.storageKey)

      /**
       * Order matters here:
       * 1. Write the image to the filesystem
       * 2. Update the image in the database
       * This is to avoid DB records that point to non-existent files,
       * OrphanImageCleaner will clean files on disk without DB records, but not
       * the other way around.
       */
      // Capture staged storage keys before the update so we can delete them afterwards.
      // After the DB update the version row is no longer marked isStaged, so querying after
      // would miss the key that was just promoted.
      const stagedStorageKeys = await this.imageRepository.findStagedStorageKeys(currentImage.id)

      await this.imageStorageService.storeImageBuffer(resizedBuffer, currentImage.storageKey)
      const updatedImage = await this.imageRepository.update(currentImage)

      // Persisted successfully — clean up old staged files.
      await Promise.all(stagedStorageKeys.map((storageKey) => this.imageStorageService.deleteImage(new NonEmptyString(storageKey))))

      // Enforce version retention: keep only the newest N versions
      const prunedStorageKeys = await this.imageRepository.pruneOldVersions(currentImage.id.value, this.versionRetentionCount)
      await Promise.all(prunedStorageKeys.map((storageKey) => this.imageStorageService.deleteImage(new NonEmptyString(storageKey))))

      return this.imageApplicationMapper.toDomainEntity(updatedImage, currentImage.base64.value)
    } catch (error) {
      logger.error(`Failed to update image ${currentImage.id.value}`, error)
      throw new DataPersistenceError(error)
    }
  }

  async delete(image: Image): Promise<void> {
    try {
      const storageKeysForImage = await this.imageRepository.delete(image)
      await Promise.allSettled(
        storageKeysForImage.map((storageKey) => this.imageStorageService.deleteImage(new NonEmptyString(storageKey)))
      )
    } catch (error) {
      logger.error(`Failed to delete image ${image.id.value}`, error)
      throw new DataPersistenceError(error)
    }
  }

  private async getResizedImageBuffer(base64: Base64Image) {
    const imageBuffer = this.imageFileService.convertBase64ImageToBuffer(base64)
    return await this.imageFileService.resizeImageBuffer(imageBuffer, 1080)
  }
}
