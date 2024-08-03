import { ImageMetadata, IImageMetadataRepository, PostId } from '@hatsuportal/domain'
import { Logger } from '@hatsuportal/common'
import connection from '../common/database/connection'
import { IImageMetadataInfrastructureMapper, ImageMetadataDatabaseSchema } from '@hatsuportal/infrastructure'
import { DataPersistenceError, NotFoundError } from '@hatsuportal/application'

const logger = new Logger('ImageRepository')

export default class ImageMetadataRepository implements IImageMetadataRepository {
  constructor(private readonly imageMetadataMapper: IImageMetadataInfrastructureMapper) {}

  async findById(id: PostId): Promise<ImageMetadata | null> {
    const imageMetadataRecord = await connection
      .join('users', 'images.createdBy', '=', 'users.id')
      .select('images.*', 'users.name as createdByUserName')
      .from<ImageMetadataDatabaseSchema, ImageMetadataDatabaseSchema>('images')
      .where('images.id', id.value)
      .first()
    if (!imageMetadataRecord) {
      return null
    }
    return this.imageMetadataMapper.toDomainEntity(imageMetadataRecord)
  }

  async insert(imageMetadata: ImageMetadata): Promise<ImageMetadata> {
    const metadataToInsert = this.imageMetadataMapper.toInsertQuery(imageMetadata)
    try {
      await connection<any, ImageMetadataDatabaseSchema>('images').insert(metadataToInsert).onConflict('fileName').merge() // mariadb does not return inserted object
    } catch (error) {
      if (error instanceof Error) {
        logger.error((error as any)?.message)
        throw new DataPersistenceError(error.stack)
      } else {
        logger.error(error)
        throw new DataPersistenceError(`UnknownError`)
      }
    }
    const insertedImage = await this.findById(new PostId(metadataToInsert.id))
    if (!insertedImage) {
      throw new NotFoundError('Image metadata update failed because just inserted image metadata could not be found from the database.')
    }
    return insertedImage
  }

  async update(imageMetadata: ImageMetadata): Promise<ImageMetadata> {
    const metadataToUpdate = this.imageMetadataMapper.toUpdateQuery(imageMetadata)
    try {
      await connection<any, ImageMetadataDatabaseSchema>('images').insert(metadataToUpdate).onConflict('fileName').merge() // mariadb does not return inserted object
    } catch (error) {
      if (error instanceof Error) {
        logger.error((error as any)?.message)
        throw new DataPersistenceError(error.stack)
      } else {
        logger.error(error)
        throw new DataPersistenceError(`UnknownError`)
      }
    }
    const updatedImage = await this.findById(new PostId(metadataToUpdate.id))
    if (!updatedImage) {
      throw new NotFoundError('Image metadata update failed because just updated image metadata could not be found from the database.')
    }
    return updatedImage
  }

  async delete(id: PostId) {
    try {
      await connection<any, ImageMetadataDatabaseSchema>('images').where('id', id.value).delete()
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
}
