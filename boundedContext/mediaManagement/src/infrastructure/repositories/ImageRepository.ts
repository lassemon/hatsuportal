import { RepositoryBase, IDataAccessProvider, IRepositoryHelpers, ITransactionContext, DataPersistenceError } from '@hatsuportal/platform'
import { Logger } from '@hatsuportal/common'
import { ImageId, ImageVersionId, StagedImage, CurrentImage, Image } from '../../domain'
import { IImageInfrastructureMapper } from '../mappers/ImageInfrastructureMapper'
import { ImageDatabaseSchema, ImageMetadataDatabaseSchema, ImageVersionDatabaseSchema } from '../schemas/ImageMetadataDatabaseSchema'
import { IImageRepository, ImageCleanupCandidate, StagedImageVersionIdentifier } from '../../application'
import { ImageMetadataDTO } from '../../application/dtos/ImageMetadataDTO'
import { ImagePromotionLockDTO } from '../../application/dtos/ImagePromotionLockDTO'
import { ImageVersionMetadataDTO } from '../../application/dtos/ImageVersionMetadataDTO'

const logger = new Logger('ImageRepository')

export class ImageRepository extends RepositoryBase implements IImageRepository {
  private readonly imageVersionsTable: string
  constructor(
    dataAccessProvider: IDataAccessProvider,
    helpers: IRepositoryHelpers,
    transactionContext: ITransactionContext,
    private readonly imageMapper: IImageInfrastructureMapper
  ) {
    super(dataAccessProvider, helpers, transactionContext, 'images')
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

  async findAllCleanupCandidates(): Promise<ImageCleanupCandidate[]> {
    const rows = await this.table<ImageDatabaseSchema>().select('id', 'createdAt')
    // images has no updatedAt column; createdAt is a conservative age proxy for the cleanup grace period
    return rows.map((row) => ({ id: row.id, updatedAt: row.createdAt }))
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

  async findByIdAndVersionIdForUpdate(imageId: ImageId, versionId: ImageVersionId): Promise<ImageMetadataDTO | null> {
    await this.table<ImageDatabaseSchema>().where({ id: imageId.value }).forUpdate().first()

    const version = await this.database()
      .table<ImageVersionDatabaseSchema>(this.imageVersionsTable)
      .where({ imageId: imageId.value, id: versionId.value })
      .forUpdate()
      .first()

    if (!version) {
      return null
    }

    const imageMetadataRecord = await this.findImageByIdAndVersionIdRAW(imageId.value, versionId.value)
    if (!imageMetadataRecord) {
      return null
    }

    return this.imageMapper.toDTO(imageMetadataRecord)
  }

  async findPromotionLockForUpdate(imageId: ImageId, stagedVersionId: ImageVersionId): Promise<ImagePromotionLockDTO | null> {
    await this.table<ImageDatabaseSchema>().where({ id: imageId.value }).forUpdate().first()

    const stagedRow = await this.database()
      .table<ImageVersionDatabaseSchema>(this.imageVersionsTable)
      .where({ imageId: imageId.value, id: stagedVersionId.value })
      .forUpdate()
      .first()

    if (!stagedRow) {
      return null
    }

    const joined = await this.findImageByIdAndVersionIdRAW(imageId.value, stagedVersionId.value)
    if (!joined) {
      return null
    }

    const staged = this.imageMapper.toDTO(joined)

    let publishedCurrent: ImageVersionMetadataDTO | null = null
    const pointer = joined.currentVersionId

    if (pointer && pointer !== staged.versionId) {
      const currentRow = await this.database()
        .table<ImageVersionDatabaseSchema>(this.imageVersionsTable)
        .where({ imageId: imageId.value, id: pointer })
        .first()

      publishedCurrent = currentRow ? this.imageMapper.toVersionDTO(currentRow) : null
    }

    return { staged, publishedCurrent }
  }

  /**
   * Creates a new image and image version
   * Used to create a new staged image version
   * @param stagedImage
   * @returns the created image domain entity
   */
  async insertStaged(stagedImage: StagedImage): Promise<StagedImageVersionIdentifier> {
    try {
      const existing = await this.table<ImageDatabaseSchema>().select('id').where({ id: stagedImage.imageId.value }).first()

      const createdImageOnThisRun =
        !existing &&
        (
          await this.table<ImageDatabaseSchema>()
            .insert(this.imageMapper.toInsertStagedImageQuery(stagedImage))
            .onConflict('id')
            .ignore()
            .returning('id')
        ).length === 1

      try {
        const imageVersionToInsert = this.imageMapper.toInsertStagedImageVersionQuery(stagedImage)
        await this.database().table<ImageVersionDatabaseSchema>(this.imageVersionsTable).insert(imageVersionToInsert)
      } catch (error) {
        // delete the staged version row always
        try {
          await this.database().table<ImageVersionDatabaseSchema>(this.imageVersionsTable).where({ id: stagedImage.id.value }).delete()
        } catch {}
        if (createdImageOnThisRun) {
          // delete the image row only if we created it in this method to avoid nuking all image versions via ON DELETE CASCADE
          try {
            await this.table<ImageDatabaseSchema>().where({ id: stagedImage.imageId.value }).delete()
          } catch {}
        }
        return this.helpers.throwDataPersistenceError(error)
      }

      return { imageId: stagedImage.imageId, stagedVersionId: stagedImage.id }
    } catch (error: unknown) {
      return this.helpers.throwDataPersistenceError(error)
    }
  }

  async savePromotedImage(image: Image): Promise<void> {
    const updates = this.imageMapper.toPromotionUpdate(image)

    if (updates.previousCurrentVersionId !== null) {
      await this.database()
        .table<ImageVersionDatabaseSchema>(this.imageVersionsTable)
        .where({ imageId: updates.imageId, id: updates.previousCurrentVersionId })
        .update({ isCurrent: false })
    }

    await this.database()
      .table<ImageVersionDatabaseSchema>(this.imageVersionsTable)
      .where({ imageId: updates.imageId, id: updates.promotedVersion.id })
      .update({
        isStaged: updates.promotedVersion.isStaged,
        isCurrent: updates.promotedVersion.isCurrent,
        storageKey: updates.promotedVersion.storageKey
      })

    await this.table<ImageDatabaseSchema>().where({ id: updates.imageId }).update({ currentVersionId: updates.currentVersionId })
  }

  /**
   * Creates a new image and image version
   * Used to create a new current image and version
   * @param currentImage
   * @returns the created image domain entity
   */
  async insertCurrent(currentImage: CurrentImage): Promise<ImageMetadataDTO> {
    try {
      const imageToInsert = this.imageMapper.toInsertImageQuery(currentImage)
      await this.table<ImageDatabaseSchema>().insert(imageToInsert).onConflict('id').ignore() // If main image already exists, we can go forward with version insert

      const imageVersionToInsert = this.imageMapper.toInsertCurrentImageVersionQuery(currentImage)
      await this.database().table<ImageVersionDatabaseSchema>(this.imageVersionsTable).insert(imageVersionToInsert)

      await this.table<ImageDatabaseSchema>().where({ id: currentImage.id.value }).update({ currentVersionId: currentImage.id.value })

      const createdImage = await this.findById(currentImage.id)
      if (!createdImage) {
        throw new DataPersistenceError('Failed to retrieve persisted image')
      }
      return createdImage
    } catch (error: unknown) {
      return this.helpers.throwDataPersistenceError(error)
    }
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
      .andWhere('is_staged', false)
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
