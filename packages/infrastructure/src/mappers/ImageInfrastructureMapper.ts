import { Image } from '@hatsuportal/domain'
import { PostTypeEnum, PartialExceptFor, unixtimeNow, validateAndCastEnum, VisibilityEnum } from '@hatsuportal/common'
import _ from 'lodash'
import { ImageMetadataDatabaseSchema } from '../schemas/ImageMetadataDatabaseSchema'
import { ImageDTO } from '@hatsuportal/application'

export interface IImageInfrastructureMapper {
  toInsertMetadataQuery(image: Image): Omit<ImageMetadataDatabaseSchema, 'createdByUserName'>
  toUpdateMetadataQuery(image: Image): PartialExceptFor<ImageMetadataDatabaseSchema, 'id'>
  toDTO(userRecord: ImageMetadataDatabaseSchema, base64: string): ImageDTO
  toDomainEntity(userRecord: ImageMetadataDatabaseSchema, base64: string): Image
}

export class ImageInfrastructureMapper implements IImageInfrastructureMapper {
  toInsertMetadataQuery(image: Image): Omit<ImageMetadataDatabaseSchema, 'createdByUserName'> {
    return {
      id: image.id.value,
      visibility: image.visibility.value,
      fileName: image.fileName.value,
      mimeType: image.mimeType.value,
      size: image.size.value,
      ownerId: image.ownerId.value,
      ownerType: image.ownerType.value,
      createdBy: image.createdBy.value,
      createdAt: unixtimeNow(),
      updatedAt: null
    }
  }

  toUpdateMetadataQuery(image: Image): PartialExceptFor<ImageMetadataDatabaseSchema, 'id'> {
    return {
      id: image.id.value,
      visibility: image.visibility.value,
      fileName: image.fileName.value,
      mimeType: image.mimeType.value,
      size: image.size.value,
      ownerId: image.ownerId.value,
      ownerType: image.ownerType.value,
      updatedAt: unixtimeNow()
    }
  }

  toDTO(imageMetadataRecord: ImageMetadataDatabaseSchema, base64: string): ImageDTO {
    return {
      id: imageMetadataRecord.id,
      visibility: validateAndCastEnum(imageMetadataRecord.visibility, VisibilityEnum),
      fileName: imageMetadataRecord.fileName,
      mimeType: imageMetadataRecord.mimeType,
      size: imageMetadataRecord.size,
      ownerId: imageMetadataRecord.ownerId,
      ownerType: validateAndCastEnum(imageMetadataRecord.ownerType, PostTypeEnum),
      createdBy: imageMetadataRecord.createdBy,
      createdByUserName: imageMetadataRecord.createdByUserName,
      base64,
      createdAt: imageMetadataRecord.createdAt,
      updatedAt: imageMetadataRecord.updatedAt
    }
  }

  toDomainEntity(imageMetadataRecord: ImageMetadataDatabaseSchema, base64: string): Image {
    return new Image(this.toDTO(imageMetadataRecord, base64))
  }
}
