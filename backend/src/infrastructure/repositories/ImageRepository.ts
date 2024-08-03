import { Logger, unixtimeNow } from '@hatsuportal/common'
import {
  ConcurrencyError,
  DataPersistenceError,
  ForbiddenError,
  UnixTimestamp,
  Base64Image,
  FileName,
  ImageMetadataDatabaseSchema,
  Image,
  ImageId,
  IImageRepository,
  IImageInfrastructureMapper,
  IImageFileService
} from '@hatsuportal/common-bounded-context'
import { Repository } from './Repository'
import { Knex } from 'knex'

const logger = new Logger('ImageRepository')

export class ImageRepository extends Repository implements IImageRepository {
  constructor(private readonly imageMapper: IImageInfrastructureMapper, private readonly imageFileService: IImageFileService) {
    super('images')
  }

  async findById(id: ImageId): Promise<Image | null> {
    const database = await this.databaseOrTransaction()

    const imageMetadataRecord = await database(this.tableName)
      .join('users', 'images.createdById', '=', 'users.id')
      .select('images.*', 'users.name as createdByName')
      .from<ImageMetadataDatabaseSchema, ImageMetadataDatabaseSchema>(this.tableName)
      .where('images.id', id.value)
      .first()
    if (!imageMetadataRecord) {
      return null
    }
    const base64 = await this.imageFileService.getImageFromFileSystem(
      Image.getStorageFileName(
        imageMetadataRecord.ownerEntityType,
        imageMetadataRecord.ownerEntityId,
        imageMetadataRecord.createdById,
        imageMetadataRecord.fileName,
        imageMetadataRecord.mimeType
      )
    )
    return this.toDomainEntity(imageMetadataRecord, base64)
  }

  async insert(image: Image): Promise<Image> {
    try {
      await this.ensureUniqueId(image.id)

      const resizedBuffer = await this.getResizedImageBuffer(image.base64)
      const validatedImage = await this.validateAndPrepareImage(image, resizedBuffer)

      await this.createImage(validatedImage, resizedBuffer)

      return await this.getPersistedImage(validatedImage, resizedBuffer)
    } catch (error: unknown) {
      return this.throwDataPersistenceError(error, logger)
    }
  }

  async update(image: Image): Promise<Image> {
    try {
      const resizedBuffer = await this.getResizedImageBuffer(image.base64)
      const validatedImage = await this.validateAndPrepareImage(image, resizedBuffer)

      await this.updateImage(validatedImage, resizedBuffer)

      const updatedImage = await this.getPersistedImage(validatedImage, resizedBuffer)
      updatedImage.base64 = this.imageFileService.convertBufferToBase64Image(resizedBuffer, image.mimeType)
      return updatedImage
    } catch (error) {
      return this.throwDataPersistenceError(error, logger)
    }
  }

  async delete(image: Image) {
    try {
      await this.imageFileService.deleteImageFromFileSystem(image.fileName)
      const database = await this.databaseOrTransaction()
      await database(this.tableName).where('id', image.id.value).delete()
    } catch (error: unknown) {
      return this.throwDataPersistenceError(error, logger)
    }
  }

  private async getResizedImageBuffer(base64: Base64Image) {
    const imageBuffer = this.imageFileService.convertBase64ImageToBuffer(base64)
    return await this.imageFileService.resizeImageBuffer(imageBuffer)
  }

  private async validateAndPrepareImage(image: Image, buffer: Buffer): Promise<Image> {
    image.mimeType = await this.imageFileService.validateMimeType(buffer, image.fileName)
    return image
  }

  private async createImage(image: Image, buffer: Buffer): Promise<void> {
    let metadataInserted = false
    const database = await this.databaseOrTransaction()
    try {
      const metadataToInsert = this.imageMapper.toInsertMetadataQuery(image)
      await database(this.tableName).insert(metadataToInsert)
      metadataInserted = true

      await this.imageFileService.writeImageToFileSystem(buffer, image.storageFileName)
    } catch (error) {
      // Cleanup database if filesystem failed
      if (metadataInserted) {
        await database(this.tableName).where('id', image.id.value).delete()
      }
      return this.throwDataPersistenceError(error, logger)
    }
  }

  private async updateImage(image: Image, buffer: Buffer): Promise<void> {
    const baseline = this.lastLoadedMap.get(image.id.value)
    if (!baseline) throw new DataPersistenceError('Repository did not load this Image')

    const metadataToInsert = this.imageMapper.toUpdateMetadataQuery(image)
    const database = await this.databaseOrTransaction()

    // Optimistic locking pattern
    const affected = await database(this.tableName).where({ id: metadataToInsert.id, updatedAt: baseline.value }).update(metadataToInsert)
    if (affected === 0) throw new ConcurrencyError<Image>(`Image ${image.id} was modified by another user`, image)

    const tempName = FileName.createTemporaryFileName(image.fileName)
    await this.imageFileService.writeImageToFileSystem(buffer, tempName)

    try {
      await this.imageFileService.renameImageOnFileSystem(tempName, image.fileName)
    } catch (error) {
      /**
       * NOTE: IF THE RENAME FAILS, WE ROLLBACK THE TRANSACTION
       * THIS MEANS THAT THE IMAGE IS NOT UPDATED IN THE FILESYSTEM
       * AND THE DATABASE WILL BE REFERENCING THE OLD IMAGE WITH NEW METADATA
       * THIS IS NOT IDEAL, but proper atomicity is not possible with the current implementation.
       * Consider:
       * 1. Upload new file with a new unique name.
       * 2. Update row with that name inside the transaction.
       * 3. After commit succeeds, delete the old file (best-effort; occasional orphan is OK).
       * 4. Nightly janitor job to clean up orphaned files.
       */
      // Clean up orphan temp file before propagating the error
      await this.imageFileService.deleteImageFromFileSystem(tempName).catch(() => {
        logger.warn(`Failed to delete orphan temp file ${tempName}`, error)
      })
      return this.throwDataPersistenceError(error, logger)
    }
  }

  private async getPersistedImage(image: Image, buffer: Buffer): Promise<Image> {
    const insertedImage = await this.findById(image.id)
    if (!insertedImage) {
      throw new DataPersistenceError('Failed to retrieve persisted image')
    }
    insertedImage.base64 = this.imageFileService.convertBufferToBase64Image(buffer, image.mimeType)
    return insertedImage
  }

  private async ensureUniqueId(id: ImageId): Promise<void> {
    const previousImage = await this.findById(id)
    if (previousImage) {
      throw new ForbiddenError(`Cannot create image with id ${id} because it already exists.`)
    }
  }

  private async databaseOrTransaction(): Promise<Knex | Knex.Transaction> {
    return await this.getConnection()
  }

  private toDomainEntity(image: ImageMetadataDatabaseSchema, base64: string): Image {
    this.lastLoadedMap.set(image.id, new UnixTimestamp(image.updatedAt || unixtimeNow()))
    return this.imageMapper.toDomainEntity(image, base64)
  }
}
