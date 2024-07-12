import { ImageMetadata, ImageMetadataDatabaseEntity, ImageMetadataDTO, ImageMetadataRepositoryInterface } from '@hatsuportal/domain'
import { unixtimeNow, uuid } from '@hatsuportal/common'
import { Logger } from '@hatsuportal/common'
import { UnknownError } from '@hatsuportal/domain'
import { ImageMapperInterface, InsertImageMetadataQueryDTO, UpdateImageMetadataQueryDTO } from '@hatsuportal/application'
import connection from '../common/database/connection'

const logger = new Logger('ImageRepository')

export default class ImageMetadataRepository
  implements ImageMetadataRepositoryInterface<InsertImageMetadataQueryDTO, UpdateImageMetadataQueryDTO>
{
  constructor(private readonly imageMapper: ImageMapperInterface) {}

  async findById(id: string): Promise<ImageMetadata | null> {
    const imageMetadataRecord = await connection.select('*').from<any, ImageMetadataDatabaseEntity>('images').where('id', id).first()
    if (!imageMetadataRecord) {
      return null
    }
    return new ImageMetadata(imageMetadataRecord)
  }

  async insert(insertMetadataQuery: InsertImageMetadataQueryDTO): Promise<ImageMetadata> {
    const metadataToInsert: ImageMetadataDTO = {
      ...insertMetadataQuery,
      id: uuid()
    }
    try {
      await connection<any, ImageMetadataDatabaseEntity>('images').insert(metadataToInsert).onConflict('fileName').merge() // mariadb does not return inserted object
    } catch (error) {
      logger.error((error as any)?.message)
      throw new UnknownError(500, 'UnknownError')
    }
    const insertedImage = await this.findById(metadataToInsert.id)
    if (!insertedImage) {
      throw new UnknownError(
        404,
        'NotFound',
        'Image metadata update failed because just inserted image metadata could not be found from the database.'
      )
    }
    return this.imageMapper.toImageMetadata(insertedImage)
  }

  async update(updateMetadataQuery: UpdateImageMetadataQueryDTO): Promise<ImageMetadata> {
    const updatedAt = unixtimeNow()
    const metadataToUpdate = {
      ...updateMetadataQuery,
      updatedAt
    }
    try {
      await connection<any, ImageMetadataDatabaseEntity>('images').insert(metadataToUpdate).onConflict('fileName').merge() // mariadb does not return inserted object
    } catch (error) {
      logger.error((error as any)?.message)
      throw new UnknownError(500, 'UnknownError')
    }
    const updatedImage = await this.findById(metadataToUpdate.id)
    if (!updatedImage) {
      throw new UnknownError(
        404,
        'NotFound',
        'Image metadata update failed because just updated image metadata could not be found from the database.'
      )
    }
    return this.imageMapper.toImageMetadata(updatedImage)
  }

  async delete(id: string) {
    try {
      await connection<any, ImageMetadataDatabaseEntity>('images').where('id', id).delete()
    } catch (error) {
      logger.error((error as any)?.message)
      throw new UnknownError(500, 'UnknownError')
    }
  }
}
