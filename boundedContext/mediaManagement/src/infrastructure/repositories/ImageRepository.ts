import {
  RepositoryBase,
  ITransactionAware,
  IDataAccessProvider,
  IRepositoryHelpers,
  ConcurrencyError,
  DataPersistenceError
} from '@hatsuportal/platform'
import { Logger } from '@hatsuportal/common'
import { ImageId, ImageVersionId, StagedImage, CurrentImage, Image } from '../../domain'
import { IImageInfrastructureMapper } from '../mappers/ImageInfrastructureMapper'
import { ImageDatabaseSchema, ImageMetadataDatabaseSchema, ImageVersionDatabaseSchema } from '../schemas/ImageMetadataDatabaseSchema'
import { IImageRepository, StagedImageVersionIdentifier } from '../../application'
import { ImageMetadataDTO } from '../../application/dtos/ImageMetadataDTO'
import { ImageVersionMetadataDTO } from '../../application/dtos/ImageVersionMetadataDTO'

const logger = new Logger('ImageRepository')

export class ImageRepository extends RepositoryBase implements IImageRepository, ITransactionAware {
  private readonly imageVersionsTable: string
  constructor(
    dataAccessProvider: IDataAccessProvider,
    helpers: IRepositoryHelpers,
    private readonly imageMapper: IImageInfrastructureMapper
  ) {
    super(dataAccessProvider, helpers, 'images')
    this.imageVersionsTable = 'image_versions'
  }

  async findById(imageId: ImageId): Promise<ImageMetadataDTO | null> {
    const imageMetadataRecord = await this.findImageByIdRAW(imageId.value)
    if (!imageMetadataRecord) {
      return null
    }

    // no promoted version yet → return null, as if it does not exist:
    if (!imageMetadataRecord.storageKey) {
      return null
    }
    return this.imageMapper.toDTO(imageMetadataRecord)
  }

  async findByIdAndVersionId(imageId: ImageId, versionId: ImageVersionId): Promise<ImageMetadataDTO | null> {
    const imageMetadataRecord = await this.findImageByIdAndVersionIdRAW(imageId.value, versionId.value)
    if (!imageMetadataRecord) {
      return null
    }
    return this.imageMapper.toDTO(imageMetadataRecord)
  }

  async findAllStorageKeys(): Promise<string[]> {
    const database = await this.database()
    const rows: Array<{ storageKey: string }> = await database
      .table<ImageVersionDatabaseSchema>(this.imageVersionsTable)
      .select('storageKey')

    return rows.map((row) => row.storageKey)
  }

  async findStagedStorageKeys(imageId: ImageId): Promise<string[]> {
    const database = await this.database()
    const rows = await database
      .table<ImageVersionDatabaseSchema>(this.imageVersionsTable)
      .select('storageKey')
      .where({ imageId: imageId.value, isStaged: true })
    return rows.map((row) => row.storageKey)
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
      const database = await this.database()
      const existing = await this.table<ImageDatabaseSchema>().select('id').where({ id: stagedImage.imageId.value }).first()

      await database.transaction(async (trx) => {
        const createdImageOnThisRun =
          !existing &&
          (
            await trx
              .table<ImageDatabaseSchema>(this.tableName)
              .insert(this.imageMapper.toInsertStagedImageQuery(stagedImage))
              .onConflict('id')
              .ignore()
              .returning('id')
          ).length === 1

        try {
          const imageVersionToInsert = this.imageMapper.toInsertStagedImageVersionQuery(stagedImage)
          await trx.table<ImageVersionDatabaseSchema>(this.imageVersionsTable).insert(imageVersionToInsert)
        } catch (error) {
          // delete the staged version row always
          try {
            await trx.table<ImageVersionDatabaseSchema>(this.imageVersionsTable).where({ id: stagedImage.id.value }).delete()
          } catch {}
          // delete the image row only if we created it in this method to avoid nuking all image versions via ON DELETE CASCADE
          if (createdImageOnThisRun) {
            try {
              await trx.table<ImageDatabaseSchema>(this.tableName).where({ id: stagedImage.imageId.value }).delete()
            } catch {}
          }
          return this.helpers.throwDataPersistenceError(error)
        }
      })

      return { imageId: stagedImage.imageId, stagedVersionId: stagedImage.id }
    } catch (error: unknown) {
      return this.helpers.throwDataPersistenceError(error)
    }
  }

  /**
   * Creates a new image and image version
   * Used to create a new current image and version
   * @param currentImage
   * @returns the created image domain entity
   */
  async insertCurrent(currentImage: CurrentImage): Promise<ImageMetadataDTO> {
    try {
      let metadataInserted = false
      const database = await this.database()
      try {
        await database.transaction(async (trx) => {
          const imageToInsert = this.imageMapper.toInsertImageQuery(currentImage)
          await trx.table<ImageDatabaseSchema>(this.tableName).insert(imageToInsert).onConflict('id').ignore() // If main image already exists, we can go forward with version insert

          const imageVersionToInsert = this.imageMapper.toInsertCurrentImageVersionQuery(currentImage)
          await trx.table<ImageVersionDatabaseSchema>(this.imageVersionsTable).insert(imageVersionToInsert)

          await trx
            .table<ImageDatabaseSchema>(this.tableName)
            .where({ id: currentImage.id.value })
            .update({ currentVersionId: currentImage.id.value })

          metadataInserted = true
        })
      } catch (error) {
        // Cleanup database if metadata was inserted but filesystem failed
        if (metadataInserted) {
          // ON DELETE CASCADE takes care of image_versions table
          await this.table<ImageDatabaseSchema>().where('id', currentImage.id.value).delete()
        }
        return this.helpers.throwDataPersistenceError(error)
      }

      const createdImage = await this.findById(currentImage.id)
      if (!createdImage) {
        throw new DataPersistenceError('Failed to retrieve persisted image')
      }
      return createdImage
    } catch (error: unknown) {
      return this.helpers.throwDataPersistenceError(error)
    }
  }

  async discardStagedVersion({ imageId, stagedVersionId }: StagedImageVersionIdentifier): Promise<ImageVersionMetadataDTO> {
    const database = await this.database()
    const version = (await database
      .table<ImageVersionDatabaseSchema>(this.imageVersionsTable)
      .select('storage_key', 'is_staged')
      .where({ imageId: imageId.value, id: stagedVersionId.value })
      .first()) as ImageVersionDatabaseSchema | undefined

    if (!version) {
      throw new DataPersistenceError(
        `Failed to retrieve persisted image version for image ${imageId.value} and version ${stagedVersionId.value}`
      )
    }

    if (!version.isStaged) {
      // idempotent no-op
      return this.imageMapper.toVersionDTO(version)
    }

    await database
      .table<ImageVersionDatabaseSchema>(this.imageVersionsTable)
      .where({ isStaged: true, imageId: imageId.value, id: stagedVersionId.value })
      .delete()
    try {
    } catch (error) {
      logger.warn(`Failed to delete orphan temp file ${version.storageKey}`, error)
    }
    return this.imageMapper.toVersionDTO(version)
  }

  async update(currentImage: CurrentImage): Promise<ImageMetadataDTO> {
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

      return await this.updateImage(currentImage /*, resizedBuffer*/)
    } catch (error) {
      return this.helpers.throwDataPersistenceError(error)
    }
  }

  private async updateImage(currentImage: CurrentImage /*, buffer: Buffer*/): Promise<ImageMetadataDTO> {
    const database = await this.database()
    // we can write a new image to the filesystem because the image has a versioned storage key
    // i.e. we never overwrite the old image because the update has a new version number in the filename

    // Capture staged version storage keys before the transaction so we can
    // clean up their files after the new version is written.
    try {
      await database.transaction(async (transaction) => {
        // Clear previous current
        await transaction
          .table<ImageVersionDatabaseSchema>(this.imageVersionsTable)
          .where({ imageId: currentImage.id.value, isCurrent: true })
          .update({ isCurrent: false })

        // Insert new version as current, or promote a staged version to current.
        // When promoting, the staged version row already exists with the same ID but different
        // storageKey/isCurrent/isStaged values — merge those columns
        const imageVersionToInsert = this.imageMapper.toInsertCurrentImageVersionQuery(currentImage)
        await transaction.table<ImageVersionDatabaseSchema>(this.imageVersionsTable).insert(imageVersionToInsert).onConflict('id').merge()

        // Update image to point to new version
        await transaction
          .table<ImageDatabaseSchema>(this.tableName)
          .where({ id: currentImage.id.value })
          .update({ currentVersionId: imageVersionToInsert.id })
      })

      // Transaction committed successfully — clean up old staged files.
      // Done outside the transaction so a file deletion failure doesn't
      // roll back the promotion itself.
    } catch (error) {
      if (this.helpers.isUniqueViolationError(error)) {
        const constraintName = this.helpers.getConstraintName(error)
        const detail = this.helpers.tryParseUniqueViolationDetail(error)
        if (detail) {
          const { columns, values } = detail
          logger.error(`Concurrent update for image`, (error as any)?.stack)
          throw new ConcurrencyError<CurrentImage>(
            `Concurrent update for image ${currentImage.id.value} ${constraintName} ${columns.join(', ')} ${values.join(', ')}`,
            currentImage
          )
        } else {
          throw new ConcurrencyError<CurrentImage>(`Concurrent update for image ${currentImage.id.value} ${constraintName}`, currentImage)
        }
      }
      return this.helpers.throwDataPersistenceError(error)
    }

    const updatedImage = await this.findById(currentImage.id)
    if (!updatedImage) {
      throw new DataPersistenceError(`Failed to retrieve persisted image with id ${currentImage.id.value}`)
    }
    return updatedImage
  }

  async delete(image: Image): Promise<string[]> {
    try {
      const database = await this.database()

      const storageKeysForImage = await database
        .table<ImageVersionDatabaseSchema>(this.imageVersionsTable)
        .select('storageKey')
        .where({ imageId: image.id.value })

      // ON DELETE CASCADE takes care of image_versions table
      const affected = await database.table<ImageDatabaseSchema>(this.tableName).where('id', image.id.value).delete()
      if (affected.length === 0) return [] // idempotent, image already deleted

      return storageKeysForImage.map((storageKey) => storageKey.storageKey)
    } catch (error: unknown) {
      return this.helpers.throwDataPersistenceError(error)
    }
  }

  async rollbackCurrentVersion(currentImage: CurrentImage): Promise<void> {
    // ON DELETE CASCADE takes care of image_versions table
    await this.table<ImageDatabaseSchema>().where({ id: currentImage.id.value }).delete()
  }

  async pruneOldVersions(imageId: string, retainCount: number): Promise<string[]> {
    const database = await this.database()

    const allVersions = await database
      .table<ImageVersionDatabaseSchema>(this.imageVersionsTable)
      .select('id', 'storageKey')
      .where({ imageId })
      .andWhere('is_current', false)
      .orderBy('created_at', 'desc')

    const toPrune = allVersions.slice(retainCount)
    if (toPrune.length === 0) return []

    for (const version of toPrune) {
      try {
        await database.table<ImageVersionDatabaseSchema>(this.imageVersionsTable).where({ id: version.id }).delete()
      } catch (error) {
        logger.warn(`Failed to prune old image version ${version.id}`, error)
      }
    }

    logger.debug(`Pruned ${toPrune.length} old version(s) for image ${imageId}`)
    return toPrune.map((version) => version.storageKey)
  }

  // NEVER TO BE USED OUTSIDE OF THIS REPOSITORY
  // RAW in this case means without mapping to domain a entity structure
  // but still including relevant data
  private async findImageByIdRAW(imageId: string): Promise<ImageMetadataDatabaseSchema | null> {
    return await this.table<ImageMetadataDatabaseSchema>()
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
      .where(`${this.tableName}.id`, imageId)
      .first()
  }

  // NEVER TO BE USED OUTSIDE OF THIS REPOSITORY
  // RAW in this case means without mapping to application layer DTO
  // but still including relevant data
  private async findImageByIdAndVersionIdRAW(imageId: string, versionId: string): Promise<ImageMetadataDatabaseSchema | null> {
    return await this.table<ImageMetadataDatabaseSchema>()
      .innerJoin(this.imageVersionsTable, (join) => join.on(`${this.imageVersionsTable}.image_id`, '=', `${this.tableName}.id`))
      .select(
        `${this.tableName}.id`,
        `${this.tableName}.created_by_id`,
        `${this.tableName}.created_at`,
        `${this.tableName}.current_version_id`,
        `${this.imageVersionsTable}.id as version_id`,
        `${this.imageVersionsTable}.storage_key as storage_key`,
        `${this.imageVersionsTable}.mime_type as mime_type`,
        `${this.imageVersionsTable}.size as size`,
        `${this.imageVersionsTable}.is_current as is_current`,
        `${this.imageVersionsTable}.is_staged as is_staged`,
        `${this.imageVersionsTable}.created_at as updated_at`
      )
      .where(`${this.tableName}.id`, imageId)
      .where(`${this.imageVersionsTable}.id`, versionId)
      .first()
  }
}
