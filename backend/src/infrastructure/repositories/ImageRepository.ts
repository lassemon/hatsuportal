import { Base64Image, IImageRepository, Image, PostId } from '@hatsuportal/domain'
import { Logger } from '@hatsuportal/common'
import { IImageInfrastructureMapper, ImageMetadataDatabaseSchema } from '@hatsuportal/infrastructure'
import { DataPersistenceError, IImageService } from '@hatsuportal/application'
import { Knex } from 'knex'
import { Repository } from './Repository'

const logger = new Logger('ImageRepository')

export class ImageRepository extends Repository implements IImageRepository<Knex.Transaction> {
  constructor(private readonly imageMapper: IImageInfrastructureMapper, private readonly imageService: IImageService) {
    super()
  }

  async findById(id: PostId): Promise<Image | null> {
    const imageMetadataRecord = await (await this.getConnection())('images')
      .join('users', 'images.createdBy', '=', 'users.id')
      .select('images.*', 'users.name as createdByUserName')
      .from<ImageMetadataDatabaseSchema, ImageMetadataDatabaseSchema>('images')
      .where('images.id', id.value)
      .first()
    if (!imageMetadataRecord) {
      return null
    }
    const base64 = await this.imageService.getImageFromFileSystem(
      Image.getStorageFileName(
        imageMetadataRecord.ownerType,
        imageMetadataRecord.createdBy,
        imageMetadataRecord.fileName,
        imageMetadataRecord.mimeType
      )
    )
    return this.imageMapper.toDomainEntity(imageMetadataRecord, base64)
  }

  async insert(image: Image): Promise<Image> {
    try {
      const resizedBuffer = await this.getResizedImageBuffer(image.base64)
      const validatedImage = await this.validateAndPrepareImage(image, resizedBuffer)

      await this.persistImageData(validatedImage, resizedBuffer)

      return await this.getPersistedImage(validatedImage, resizedBuffer)
    } catch (error) {
      throw this.handleRepositoryError(error, 'Failed to insert image')
    }
  }

  async update(image: Image): Promise<Image> {
    try {
      const resizedBuffer = await this.getResizedImageBuffer(image.base64)
      const validatedImage = await this.validateAndPrepareImage(image, resizedBuffer)

      await this.updateImageData(validatedImage, resizedBuffer)

      const updatedImage = await this.getPersistedImage(validatedImage, resizedBuffer)
      updatedImage.base64 = this.imageService.convertBufferToBase64Image(resizedBuffer, image.mimeType)
      return updatedImage
    } catch (error) {
      if (error instanceof Error) {
        logger.error((error as any)?.message)
        throw new DataPersistenceError(error.stack)
      } else {
        logger.error(error)
        throw new DataPersistenceError(`UnknownError`)
      }
    }
  }

  async delete(image: Image) {
    try {
      await this.imageService.deleteImageFromFileSystem(image.fileName)
      await (await this.getConnection())('images').where('id', image.id.value).delete()
    } catch (error) {
      if (error instanceof Error) {
        logger.error((error as any)?.message)
        throw new DataPersistenceError(error.stack)
      } else {
        logger.error(error)
        throw new DataPersistenceError(`UnknownError`)
      }
    }
  }

  private async getResizedImageBuffer(base64: Base64Image) {
    const imageBuffer = this.imageService.convertBase64ImageToBuffer(base64)
    return await this.imageService.resizeImageBuffer(imageBuffer)
  }

  private async validateAndPrepareImage(image: Image, buffer: Buffer): Promise<Image> {
    image.mimeType = await this.imageService.validateMimeType(buffer, image.fileName)
    return image
  }

  private async persistImageData(image: Image, buffer: Buffer): Promise<void> {
    await this.imageService.writeImageToFileSystem(buffer, image.storageFileName)
    const metadataToInsert = this.imageMapper.toInsertMetadataQuery(image)
    await (await this.getConnection())('images').insert(metadataToInsert)
  }

  private async updateImageData(image: Image, buffer: Buffer): Promise<void> {
    await this.imageService.deleteImageFromFileSystem(image.storageFileName)
    await this.imageService.writeImageToFileSystem(buffer, image.storageFileName)
    const metadataToInsert = this.imageMapper.toUpdateMetadataQuery(image)
    await (await this.getConnection())('images').where('id', metadataToInsert.id).update(metadataToInsert)
  }

  private async getPersistedImage(image: Image, buffer: Buffer): Promise<Image> {
    const insertedImage = await this.findById(image.id)
    if (!insertedImage) {
      throw new DataPersistenceError('Failed to retrieve persisted image')
    }
    insertedImage.base64 = this.imageService.convertBufferToBase64Image(buffer, image.mimeType)
    return insertedImage
  }

  private handleRepositoryError(error: unknown, context: string): Error {
    if (error instanceof Error) {
      logger.error(error.stack)
      return new DataPersistenceError(`${context}: ${error.message}`)
    }
    return new DataPersistenceError(`${context}: Unknown error occurred`)
  }
}
