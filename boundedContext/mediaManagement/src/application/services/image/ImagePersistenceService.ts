import { DataPersistenceError, ITransactionContext, IUnitOfWork } from '@hatsuportal/platform'
import { Logger } from '@hatsuportal/common'
import { NonEmptyString, UnixTimestamp } from '@hatsuportal/shared-kernel'
import { Image, StagedImage, Base64Image, ImageStorageKey, MimeType } from '../../../domain'
import { IStorageKeyGenerator } from '../IStorageKeyGenerator'
import { IImageStorageService } from '../IImageStorageService'
import IImageFileService from '../IImageFileService'
import { PreparedStagedImageDTO } from '../../dtos/PreparedStagedImageDTO'
import {
  PreparedPromoteStagedVersionDTO,
  PromoteStagedVersionCommitOutcome,
  PromoteStagedVersionFinalizeOutcome
} from '../../dtos/PreparedPromoteStagedVersionDTO'
import { ImageId, ImageVersionId } from '../../../domain'
import { IImageRepository, StagedImageVersionIdentifier } from '../../repositories/IImageRepository'
import { IImageApplicationMapper } from '../../mappers/ImageApplicationMapper'

const logger = new Logger('ImagePersistenceService')

/**
 * Staged image persistence is a three-step workflow used when file storage and
 * database metadata must stay consistent across a shared Unit of Work:
 *
 * 1. {@link prepareStagedImageFile } — uploads the file outside the DB transaction.
 * 2. {@link registerPreparedStagedImageFileRollbackCleanup} — inside the transaction,
 *    registers deletion of that file if the transaction rolls back (prevents
 *    unlinked blobs in storage).
 * 3. {@link saveStagedImageMetadata} — inside the transaction, inserts staged
 *    image metadata.
 *
 * If the transaction commits, the uploaded file is kept and linked via metadata.
 * If it rolls back, the file is removed so storage is not left with orphan staged objects.
 */
export interface IImagePersistenceService {
  /**
   * Uploads and validates a staged image file to storage, outside any DB transaction.
   * Returns a handle ({@link PreparedStagedImageDTO}) for use inside a subsequent transaction.
   *
   * On failure after upload, cleans up the written object immediately.
   * Does not write image metadata to the database.
   */
  prepareStagedImageFile(stagedImage: StagedImage): Promise<PreparedStagedImageDTO>
  /**
   * Enrolls cleanup of a prepared staged image's storage object when the active
   * transaction rolls back.
   *
   * Call this as the first step inside a transaction after {@link prepareStagedImageFile},
   * before {@link saveStagedImageMetadata}.
   *
   * Does not delete the file on success — a committed transaction means the blob
   * should remain until promotion or explicit discard.
   *
   * @throws When called outside an active transaction scope.
   */
  registerPreparedStagedImageFileRollbackCleanup(prepared: PreparedStagedImageDTO): void
  /**
   * Persists staged image metadata for a file already uploaded by {@link prepareStagedImageFile}.
   *
   * Must be called inside the same transaction where
   * {@link registerPreparedStagedImageFileRollbackCleanup} was registered, so a failed
   * metadata write still triggers storage cleanup.
   *
   * @throws When called outside an active transaction scope.
   */
  saveStagedImageMetadata(stagedImage: StagedImage): Promise<StagedImageVersionIdentifier>
  /**
   * Runs the full staged-version promotion workflow: copy file outside the transaction,
   * commit metadata inside a transaction, then finalize storage cleanup.
   *
   * Returns {@link PromoteStagedVersionCommitOutcome} indicating whether promotion ran
   * or the version was already current.
   */
  promoteStagedVersion(imageId: ImageId, stagedVersionId: ImageVersionId): Promise<PromoteStagedVersionCommitOutcome>
  /**
   * Deletes image metadata inside a transaction. Returns storage keys for post-commit file cleanup.
   */
  deleteImageMetadata(image: Image): Promise<string[]>
  /**
   * Deletes image files from storage after metadata deletion has committed.
   */
  deleteImageFiles(storageKeys: string[]): Promise<void>
  /**
   * Prunes retired non-staged version metadata and returns pruned storage keys for post-commit cleanup.
   */
  pruneOldVersionMetadata(imageId: ImageId): Promise<string[]>
  /**
   * Deletes pruned version files from storage after metadata pruning has committed.
   */
  deletePrunedVersionFiles(storageKeys: string[]): Promise<void>
}

export class ImagePersistenceService implements IImagePersistenceService {
  constructor(
    private readonly imageRepository: IImageRepository,
    private readonly imageFileService: IImageFileService,
    private readonly imageStorageService: IImageStorageService,
    private readonly storageKeyGenerator: IStorageKeyGenerator,
    private readonly transactionContext: ITransactionContext,
    private readonly versionRetentionCount: number,
    private readonly unitOfWork: IUnitOfWork<ImageId, UnixTimestamp>,
    private readonly imageApplicationMapper: IImageApplicationMapper
  ) {}

  async prepareStagedImageFile(stagedImage: StagedImage): Promise<PreparedStagedImageDTO> {
    let fileWritten = false

    try {
      stagedImage.base64.assertHasInlineContent()
      const resizedBuffer = await this.getResizedImageBuffer(stagedImage.base64)
      await this.imageFileService.validateMimeType(resizedBuffer, stagedImage.storageKey)

      await this.imageStorageService.storeImageBuffer(resizedBuffer, stagedImage.storageKey)
      fileWritten = true

      return {
        imageId: stagedImage.imageId.value,
        stagedVersionId: stagedImage.id.value,
        storageKey: stagedImage.storageKey.value,
        mimeType: stagedImage.mimeType.value,
        size: stagedImage.size.value,
        createdById: stagedImage.createdById.value
      }
    } catch (error) {
      if (fileWritten) {
        try {
          await this.imageStorageService.deleteImage(stagedImage.storageKey)
        } catch (cleanupError) {
          logger.error(`Failed to delete uploaded object after prepare failure for ${stagedImage.imageId.value}`, cleanupError)
        }
      }
      logger.error(`Failed to prepare staged image ${stagedImage.imageId.value}`, error)
      throw new DataPersistenceError(error)
    }
  }

  registerPreparedStagedImageFileRollbackCleanup(prepared: PreparedStagedImageDTO): void {
    this.transactionContext.requireActiveScope()
    this.transactionContext.registerAfterRollback(async () => {
      try {
        await this.imageStorageService.deleteImage(new NonEmptyString(prepared.storageKey))
      } catch (cleanupError) {
        logger.error(`Failed to delete prepared object ${prepared.storageKey} during rollback`, cleanupError)
      }
    })
  }

  async saveStagedImageMetadata(stagedImage: StagedImage): Promise<StagedImageVersionIdentifier> {
    this.transactionContext.requireActiveScope()
    return await this.imageRepository.insertStaged(stagedImage)
  }

  private async preparePromotedImageFile(imageId: ImageId, stagedVersionId: ImageVersionId): Promise<PreparedPromoteStagedVersionDTO | null> {
    const preliminary = await this.imageRepository.findByIdAndVersionId(imageId, stagedVersionId)
    if (!preliminary) {
      throw new DataPersistenceError(`Cannot promote missing image '${imageId.value}' version '${stagedVersionId.value}'.`)
    }

    if (!preliminary.isStaged && preliminary.isCurrent) {
      return null
    }

    if (!preliminary.isStaged) {
      throw new DataPersistenceError(`Cannot promote image '${imageId.value}' version '${stagedVersionId.value}' because it is not staged.`)
    }

    const parsedKey = ImageStorageKey.fromString(preliminary.storageKey)
    const permanentStorageKey = this.storageKeyGenerator.generateStorageKey(
      parsedKey.entityType,
      parsedKey.role,
      parsedKey.ownerEntityId,
      parsedKey.versionId,
      parsedKey.createdById,
      new MimeType(preliminary.mimeType),
      { isStaged: false }
    )

    try {
      await this.imageStorageService.copyImage(new NonEmptyString(preliminary.storageKey), new NonEmptyString(permanentStorageKey.value))
    } catch (copyError) {
      const reread = await this.imageRepository.findByIdAndVersionId(imageId, stagedVersionId)
      if (reread && !reread.isStaged && reread.isCurrent) {
        return null
      }
      logger.error(`Failed to copy staged image ${imageId.value} version ${stagedVersionId.value} for promotion`, copyError)
      throw new DataPersistenceError(copyError)
    }

    return {
      imageId: imageId.value,
      stagedVersionId: stagedVersionId.value,
      stagedSourceKey: preliminary.storageKey,
      permanentStorageKey: permanentStorageKey.value
    }
  }

  private registerPromoteStagedImageFileRollbackCleanup(prepared: PreparedPromoteStagedVersionDTO): void {
    this.transactionContext.requireActiveScope()
    this.transactionContext.registerAfterRollback(async () => {
      try {
        await this.imageStorageService.deleteImage(new NonEmptyString(prepared.permanentStorageKey))
      } catch (cleanupError) {
        logger.error(`Failed to delete copied permanent object ${prepared.permanentStorageKey} during rollback`, cleanupError)
      }
    })
  }

  private async commitPromoteStagedVersion(prepared: PreparedPromoteStagedVersionDTO): Promise<PromoteStagedVersionCommitOutcome> {
    this.transactionContext.requireActiveScope()

    const imageId = new ImageId(prepared.imageId)
    const stagedVersionId = new ImageVersionId(prepared.stagedVersionId)
    const permanentStorageKey = ImageStorageKey.fromString(prepared.permanentStorageKey)

    const lock = await this.imageRepository.findPromotionLockForUpdate(imageId, stagedVersionId)
    if (!lock) {
      throw new DataPersistenceError(`Cannot promote missing image '${prepared.imageId}' version '${prepared.stagedVersionId}'.`)
    }

    if (!lock.staged.isStaged && lock.staged.isCurrent) {
      return 'already-current'
    }

    const image = this.imageApplicationMapper.toImageForPromotion(lock)
    image.promoteToCurrent(stagedVersionId, permanentStorageKey)

    await this.imageRepository.savePromotedImage(image)
    return 'promoted'
  }

  private async finalizePromoteStagedVersion(
    outcome: PromoteStagedVersionFinalizeOutcome,
    prepared: PreparedPromoteStagedVersionDTO
  ): Promise<void> {
    if (outcome === 'promoted') {
      try {
        await this.imageStorageService.deleteImage(new NonEmptyString(prepared.stagedSourceKey))
      } catch (error) {
        logger.error(`Failed to delete staged source after promotion for ${prepared.imageId}`, error)
      }
      return
    }

    try {
      await this.imageStorageService.deleteImage(new NonEmptyString(prepared.permanentStorageKey))
    } catch (error) {
      logger.error(`Failed to delete unused permanent object for ${outcome} promotion ${prepared.imageId}`, error)
    }
  }

  async promoteStagedVersion(imageId: ImageId, stagedVersionId: ImageVersionId): Promise<PromoteStagedVersionCommitOutcome> {
    const prepared = await this.preparePromotedImageFile(imageId, stagedVersionId)
    if (!prepared) {
      return 'already-current'
    }

    let outcome: PromoteStagedVersionCommitOutcome = 'promoted'

    await this.unitOfWork.execute(async () => {
      this.registerPromoteStagedImageFileRollbackCleanup(prepared)
      outcome = await this.commitPromoteStagedVersion(prepared)
      return []
    })

    await this.finalizePromoteStagedVersion(outcome, prepared)
    return outcome
  }

  async deleteImageMetadata(image: Image): Promise<string[]> {
    this.transactionContext.requireActiveScope()
    return await this.imageRepository.delete(image)
  }

  async deleteImageFiles(storageKeys: string[]): Promise<void> {
    await Promise.allSettled(storageKeys.map((storageKey) => this.imageStorageService.deleteImage(new NonEmptyString(storageKey))))
  }

  async pruneOldVersionMetadata(imageId: ImageId): Promise<string[]> {
    this.transactionContext.requireActiveScope()
    return await this.imageRepository.pruneOldVersions(imageId.value, this.versionRetentionCount)
  }

  async deletePrunedVersionFiles(storageKeys: string[]): Promise<void> {
    await Promise.allSettled(storageKeys.map((storageKey) => this.imageStorageService.deleteImage(new NonEmptyString(storageKey))))
  }

  private async getResizedImageBuffer(base64: Base64Image) {
    const imageBuffer = this.imageFileService.convertBase64ImageToBuffer(base64)
    return await this.imageFileService.resizeImageBuffer(imageBuffer, 1080)
  }
}
