import { PartialExceptFor, unixtimeNow, validateAndCastEnum, EntityTypeEnum, BASE64_PREFIX } from '@hatsuportal/common'
import _ from 'lodash'
import { ImageMetadataDatabaseSchema } from '../schemas/ImageMetadataDatabaseSchema'
import { Image } from '../../domain'
import { ImageDTO } from '../../application/dtos/ImageDTO'

export interface IImageInfrastructureMapper {
  toInsertMetadataQuery(image: Image): Omit<ImageMetadataDatabaseSchema, 'createdByName'>
  toUpdateMetadataQuery(image: Image): PartialExceptFor<ImageMetadataDatabaseSchema, 'id'>
  toDTO(userRecord: ImageMetadataDatabaseSchema, base64: string): ImageDTO
  toDomainEntity(userRecord: ImageMetadataDatabaseSchema, base64: string): Image
}

export class ImageInfrastructureMapper implements IImageInfrastructureMapper {
  toInsertMetadataQuery(image: Image): Omit<ImageMetadataDatabaseSchema, 'createdByName'> {
    const now = unixtimeNow()
    return {
      id: image.id.value,
      fileName: image.fileName.value,
      mimeType: image.mimeType.value,
      size: image.size.value,
      ownerEntityId: image.ownerEntityId.value,
      ownerEntityType: image.ownerEntityType.value,
      createdById: image.createdById.value,
      createdAt: now,
      updatedAt: now
    }
  }

  toUpdateMetadataQuery(image: Image): PartialExceptFor<ImageMetadataDatabaseSchema, 'id'> {
    return {
      id: image.id.value,
      fileName: image.fileName.value,
      mimeType: image.mimeType.value,
      size: image.size.value,
      ownerEntityId: image.ownerEntityId.value,
      ownerEntityType: image.ownerEntityType.value,
      updatedAt: unixtimeNow()
    }
  }

  toDTO(imageMetadataRecord: ImageMetadataDatabaseSchema, base64: string): ImageDTO {
    return {
      id: imageMetadataRecord.id,
      fileName: imageMetadataRecord.fileName,
      mimeType: imageMetadataRecord.mimeType,
      size: imageMetadataRecord.size,
      ownerEntityId: imageMetadataRecord.ownerEntityId,
      ownerEntityType: validateAndCastEnum(imageMetadataRecord.ownerEntityType, EntityTypeEnum),
      createdById: imageMetadataRecord.createdById,
      createdByName: imageMetadataRecord.createdByName,
      base64,
      createdAt: imageMetadataRecord.createdAt,
      updatedAt: imageMetadataRecord.updatedAt
    }
  }

  toDomainEntity(imageMetadataRecord: ImageMetadataDatabaseSchema, base64: string): Image {
    return Image.reconstruct(this.toDTO(imageMetadataRecord, base64))
  }
}
