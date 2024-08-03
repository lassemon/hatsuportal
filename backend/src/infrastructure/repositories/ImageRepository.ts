import { ConcurrencyError, DataPersistenceError, ITransactionAware } from '@hatsuportal/platform'
import { Logger } from '@hatsuportal/common'
import { Repository } from './Repository'
import {
  Base64Image,
  CurrentImage,
  IImageFileService,
  IImageInfrastructureMapper,
  IImageRepository,
  Image,
  ImageDatabaseSchema,
  ImageId,
  ImageMetadataDatabaseSchema,
  ImageVersionId,
  ImageVersionWithBase64,
  StagedImage,
  StagedImageVersionIdentifier
} from '@hatsuportal/media-management'
import { NonEmptyString } from '@hatsuportal/shared-kernel'

const logger = new Logger('ImageRepository')

export class ImageRepository extends Repository implements IImageRepository, ITransactionAware {
  private readonly imageVersionsTable: string
  // TODO, might need to remove imageFileService from here and make a new imageLookupService to use it from
  // - why? because we need to make sure filenames don't clash and that requires domain logic that we should not
  // pollute the repository with
  // perhaps we even need StoryImageLookupService and RecipeImageLookupService etc.
  constructor(private readonly imageMapper: IImageInfrastructureMapper, private readonly imageFileService: IImageFileService) {
    super('images')
    this.imageVersionsTable = 'image_versions'
  }

  async findById(imageId: ImageId): Promise<Image | null> {
    const imageMetadataRecord = await this.findImageByIdRAW(imageId.value)
    if (!imageMetadataRecord) {
      return null
    }

    // no promoted version yet → return null, as if it does not exist:
    if (!imageMetadataRecord.storageKey) {
      return null
    }
    const base64 = await this.imageFileService.getImageFromFileSystem(new NonEmptyString(imageMetadataRecord.storageKey))
    return this.toDomainEntity(imageMetadataRecord, base64)
  }

  async findByIdAndVersionId(imageId: ImageId, versionId: ImageVersionId): Promise<Image | null> {
    const imageMetadataRecord = await this.findImageByIdAndVersionIdRAW(imageId.value, versionId.value)
    if (!imageMetadataRecord) {
      return null
    }
    const base64 = await this.imageFileService.getImageFromFileSystem(new NonEmptyString(imageMetadataRecord.storageKey))
    return this.toDomainEntity(imageMetadataRecord, base64)
  }

  async findByIdWithVersions(imageId: ImageId, versionIdsToInclude?: ImageVersionId[]): Promise<Image | null> {
    const imageMeta = await this.findImageByIdRAW(imageId.value)
    if (!imageMeta) return null

    const allVersions = await this.findAllVersionsByIdRAW(imageId.value)
    const wanted = versionIdsToInclude?.map((version) => version.value)

    // Default to hydrating the current version only
    const versionsToHydrate: ImageVersionWithBase64[] = wanted
      ? allVersions.filter((version) => wanted.includes(version.id))
      : allVersions.filter((version) => version.isCurrent)

    const versionsWithBase64 = await Promise.all(
      versionsToHydrate.map(async (version) => {
        const base64 = await this.imageFileService.getImageFromFileSystem(new NonEmptyString(version.storageKey))
        return {
          id: version.id,
          imageId: version.imageId,
          storageKey: version.storageKey,
          mimeType: version.mimeType,
          size: version.size,
          isCurrent: version.isCurrent,
          isStaged: version.isStaged,
          createdAt: version.createdAt,
          base64
        }
      })
    )

    // Requires the mapper method below
    return this.imageMapper.toDomainEntityWithVersions(imageMeta, versionsWithBase64)
  }

  /**
   * Creates a new image and image version
   * Used to create a new staged image version
   * @param stagedImage
   * @returns the created image domain entity
   */
  async insertStaged(stagedImage: StagedImage): Promise<StagedImageVersionIdentifier> {
    // Do not call ensureUniqueId here to allow "stage a new version for an existing image" flow.
    try {
      const resizedBuffer = await this.getResizedImageBuffer(stagedImage.base64)
      await this.imageFileService.validateMimeType(resizedBuffer, stagedImage.storageKey)

      const database = await this.databaseOrTransaction()
      const existing = await database(this.tableName)
        .select('id')
        .from<ImageDatabaseSchema>(this.tableName)
        .where({ id: stagedImage.imageId.value })
        .first()

      await database.transaction(async (trx) => {
        const createdImageOnThisRun =
          !existing &&
          (
            await trx(this.tableName)
              .insert(this.imageMapper.toInsertStagedImageQuery(stagedImage))
              .onConflict('id')
              .ignore()
              .returning('id')
          ).length === 1

        try {
          const imageVersionToInsert = this.imageMapper.toInsertStagedImageVersionQuery(stagedImage)
          await trx(this.imageVersionsTable).insert(imageVersionToInsert)

          await this.imageFileService.writeImageToFileSystem(resizedBuffer, stagedImage.storageKey)
        } catch (error) {
          // delete the staged version row always
          try {
            await trx(this.imageVersionsTable).where({ id: stagedImage.id.value }).delete()
          } catch {}
          // delete the image row only if we created it in this method to avoid nuking all image versions via ON DELETE CASCADE
          if (createdImageOnThisRun) {
            try {
              await trx(this.tableName).where({ id: stagedImage.imageId.value }).delete()
            } catch {}
          }
          return this.throwDataPersistenceError(error)
        }
      })

      return { imageId: stagedImage.imageId, stagedVersionId: stagedImage.id }
    } catch (error: unknown) {
      return this.throwDataPersistenceError(error)
    }
  }

  /**
   * Creates a new image and image version
   * Used to create a new current image and version
   * @param currentImage
   * @returns the created image domain entity
   */
  async insertCurrent(currentImage: CurrentImage): Promise<Image> {
    try {
      const resizedBuffer = await this.getResizedImageBuffer(currentImage.base64)
      await this.imageFileService.validateMimeType(resizedBuffer, currentImage.storageKey)

      let metadataInserted = false
      const database = await this.databaseOrTransaction()
      try {
        await database.transaction(async (trx) => {
          const imageToInsert = this.imageMapper.toInsertImageQuery(currentImage)
          await trx(this.tableName).insert(imageToInsert).onConflict('id').ignore() // If main image already exists, we can go forward with version insert

          const imageVersionToInsert = this.imageMapper.toInsertCurrentImageVersionQuery(currentImage)
          await trx(this.imageVersionsTable).insert(imageVersionToInsert)

          await trx(this.tableName).where({ id: currentImage.id.value }).update({ current_version_id: currentImage.id.value })

          metadataInserted = true

          await this.imageFileService.writeImageToFileSystem(resizedBuffer, currentImage.storageKey)
        })
      } catch (error) {
        // Cleanup database if metadata was inserted but filesystem failed
        if (metadataInserted) {
          // ON DELETE CASCADE takes care of image_versions table
          await database(this.tableName).where('id', currentImage.id.value).delete()
        }
        return this.throwDataPersistenceError(error)
      }

      const createdImage = await this.findById(currentImage.id)
      if (!createdImage) {
        throw new DataPersistenceError('Failed to retrieve persisted image')
      }
      return createdImage
    } catch (error: unknown) {
      return this.throwDataPersistenceError(error)
    }
  }

  async discardStagedVersion({ imageId, stagedVersionId }: StagedImageVersionIdentifier): Promise<void> {
    const database = await this.databaseOrTransaction()

    const version = await database(this.imageVersionsTable)
      .select('storage_key', 'is_staged')
      .where({ imageId: imageId.value, id: stagedVersionId.value })
      .first()

    if (!version || !version.is_staged) {
      // idempotent no-op
      return
    }

    await database(this.imageVersionsTable).where({ is_staged: true, imageId: imageId.value, id: stagedVersionId.value }).delete()
    try {
      await this.imageFileService.deleteImageFromFileSystem(version.storage_key)
    } catch (error) {
      logger.warn(`Failed to delete orphan temp file ${version.storage_key}`, error)
    }
    return
  }

  async update(currentImage: CurrentImage): Promise<Image> {
    try {
      const existingImage = await this.findImageByIdRAW(currentImage.id.value)
      if (!existingImage) {
        throw new DataPersistenceError(`Cannot update. Image ${currentImage.id.value} has no current version`)
      }

      if (existingImage.storageKey === currentImage.storageKey.value) {
        throw new DataPersistenceError(
          `Cannot update. Image ${currentImage.id.value} has the same storage key as the one provided in update`
        )
      }
      const resizedBuffer = await this.getResizedImageBuffer(currentImage.base64)
      await this.imageFileService.validateMimeType(resizedBuffer, currentImage.storageKey)

      return await this.updateImage(currentImage, resizedBuffer)
    } catch (error) {
      return this.throwDataPersistenceError(error)
    }
  }

  private async updateImage(currentImage: CurrentImage, buffer: Buffer): Promise<Image> {
    const database = await this.databaseOrTransaction()
    // we can write a new image to the filesystem because the image has a versioned storage key
    // i.e. we never overwrite the old image because the update has a new version number in the filename

    try {
      await database.transaction(async (trx) => {
        // Clear previous current
        await trx(this.imageVersionsTable).where({ imageId: currentImage.id.value, is_current: true }).update({ is_current: false })

        // Insert new version as current
        const imageVersionToInsert = this.imageMapper.toInsertCurrentImageVersionQuery(currentImage)
        await trx(this.imageVersionsTable).insert(imageVersionToInsert)

        // Update image to point to new version
        await trx(this.tableName).where({ id: currentImage.id.value }).update({ current_version_id: imageVersionToInsert.id })

        await this.imageFileService.writeImageToFileSystem(buffer, currentImage.storageKey)
      })
    } catch (error) {
      if (this.isPostgresUniqueViolationError(error)) {
        const constraintName = this.getPostgresConstraintName(error)
        const detail = this.tryParseUniqueViolationDetail(error)
        if (detail) {
          const { columns, values } = detail
          throw new ConcurrencyError<CurrentImage>(
            `Concurrent update for image ${currentImage.id.value} ${constraintName} ${columns.join(', ')} ${values.join(', ')}`,
            currentImage
          )
        } else {
          throw new ConcurrencyError<CurrentImage>(`Concurrent update for image ${currentImage.id.value} ${constraintName}`, currentImage)
        }
      }
      return this.throwDataPersistenceError(error)
    }

    const updatedImage = await this.findById(currentImage.id)
    if (!updatedImage) {
      throw new DataPersistenceError(`Failed to retrieve persisted image with id ${currentImage.id.value}`)
    }
    return updatedImage
  }

  async delete(image: Image): Promise<Image> {
    try {
      const database = await this.databaseOrTransaction()

      const storageKeysForImage = await database(this.imageVersionsTable).select('storage_key').where({ imageId: image.id.value })

      // ON DELETE CASCADE takes care of image_versions table
      const affected = await database(this.tableName).where('id', image.id.value).delete()
      if (affected === 0) return image // idempotent, image already deleted

      await Promise.allSettled(
        storageKeysForImage.map((storageKey) => this.imageFileService.deleteImageFromFileSystem(new NonEmptyString(storageKey.storage_key)))
      )

      return image
    } catch (error: unknown) {
      return this.throwDataPersistenceError(error)
    }
  }

  // NEVER TO BE USED OUTSIDE OF THIS REPOSITORY
  // RAW in this case means without mapping to domain a entity structure
  // but still including relevant data
  private async findImageByIdRAW(imageId: string): Promise<ImageMetadataDatabaseSchema | null> {
    logger.debug(`Finding image by id ${imageId} from table ${this.tableName}`)
    const database = await this.databaseOrTransaction()
    return await database(this.tableName)
      .leftJoin(this.imageVersionsTable, (join) => join.on(`${this.tableName}.current_version_id`, '=', `${this.imageVersionsTable}.id`))
      .select(
        `${this.tableName}.id as id`,
        `${this.tableName}.created_by_id as created_by_id`,
        `${this.tableName}.created_at as created_at`,
        `${this.tableName}.current_version_id as current_version_id`,
        `${this.imageVersionsTable}.id as version_id`,
        `${this.imageVersionsTable}.storage_key as storage_key`,
        `${this.imageVersionsTable}.mime_type as mime_type`,
        `${this.imageVersionsTable}.size as size`,
        `${this.imageVersionsTable}.is_current as is_current`,
        `${this.imageVersionsTable}.is_staged as is_staged`,
        `${this.imageVersionsTable}.created_at as updated_at`
      )
      .from<ImageMetadataDatabaseSchema>(this.tableName)
      .where(`${this.tableName}.id`, imageId)
      .first()
  }

  // NEVER TO BE USED OUTSIDE OF THIS REPOSITORY
  // RAW in this case means without mapping to domain a entity structure
  // but still including relevant data
  private async findImageByIdAndVersionIdRAW(imageId: string, versionId: string): Promise<ImageMetadataDatabaseSchema | null> {
    const database = await this.databaseOrTransaction()
    return await database(this.tableName)
      .innerJoin(this.imageVersionsTable, (join) => join.on(`${this.imageVersionsTable}.image_id`, '=', `${this.tableName}.id`))
      .select(
        `${this.tableName}.*`,
        `${this.imageVersionsTable}.id as version_id`,
        `${this.imageVersionsTable}.storage_key as storage_key`,
        `${this.imageVersionsTable}.mime_type as mime_type`,
        `${this.imageVersionsTable}.size as size`,
        `${this.imageVersionsTable}.is_current as is_current`,
        `${this.imageVersionsTable}.is_staged as is_staged`,
        `${this.imageVersionsTable}.created_at as updated_at`
      )
      .from<ImageMetadataDatabaseSchema>(this.tableName)
      .where(`${this.tableName}.id`, imageId)
      .where(`${this.imageVersionsTable}.id`, versionId)
      .first()
  }

  // NEVER TO BE USED OUTSIDE OF THIS REPOSITORY
  // Returns ALL versions for an image (current + staged), metadata only.
  private async findAllVersionsByIdRAW(imageId: string) {
    const database = await this.databaseOrTransaction()
    return await database(this.imageVersionsTable)
      .select('id', 'image_id', 'storage_key', 'mime_type', 'size', 'is_current', 'is_staged', 'created_at')
      .where({ imageId: imageId })
      .orderBy('created_at', 'asc')
  }

  private async getResizedImageBuffer(base64: Base64Image) {
    const imageBuffer = this.imageFileService.convertBase64ImageToBuffer(base64)
    // TODO, separate repository from image binary file service
    // we need to decide per business use case what the target width should be
    return await this.imageFileService.resizeImageBuffer(imageBuffer, 1080)
  }

  private toDomainEntity(image: ImageMetadataDatabaseSchema, base64: string): Image {
    return this.imageMapper.toDomainEntity(image, base64)
  }
}
