import { ImageMetadata } from '@hatsuportal/domain'
import { PostTypeEnum, PartialExceptFor, unixtimeNow, validateAndCastEnum, VisibilityEnum } from '@hatsuportal/common'
import _ from 'lodash'
import { ImageMetadataDatabaseSchema } from '../schemas/ImageMetadataDatabaseSchema'
import { ImageMetadataDTO } from '@hatsuportal/application'

export interface IImageMetadataInfrastructureMapper {
  toInsertQuery(imageMetadata: ImageMetadata): ImageMetadataDatabaseSchema
  toUpdateQuery(imageMetadata: ImageMetadata): PartialExceptFor<ImageMetadataDatabaseSchema, 'id'>
  toDTO(userRecord: ImageMetadataDatabaseSchema): ImageMetadataDTO
  toDomainEntity(userRecord: ImageMetadataDatabaseSchema): ImageMetadata
}

export class ImageMetadataInfrastructureMapper implements IImageMetadataInfrastructureMapper {
  toInsertQuery(imageMetadata: ImageMetadata): ImageMetadataDatabaseSchema {
    return {
      id: imageMetadata.id.value,
      visibility: imageMetadata.visibility.value,
      fileName: imageMetadata.fileName.value,
      mimeType: imageMetadata.mimeType.value,
      size: imageMetadata.size.value,
      ownerId: imageMetadata.ownerId?.value ?? null,
      ownerType: imageMetadata.ownerType?.value ?? null,
      createdBy: imageMetadata.createdBy.value,
      createdByUserName: imageMetadata.createdByUserName.value,
      createdAt: unixtimeNow(),
      updatedAt: null
    }
  }

  toUpdateQuery(imageMetadata: ImageMetadata): PartialExceptFor<ImageMetadataDatabaseSchema, 'id'> {
    return {
      id: imageMetadata.id.value,
      visibility: imageMetadata.visibility.value,
      fileName: imageMetadata.fileName.value,
      mimeType: imageMetadata.mimeType.value,
      size: imageMetadata.size.value,
      ownerId: imageMetadata.ownerId?.value ?? null,
      ownerType: imageMetadata.ownerType?.value ?? null,
      updatedAt: unixtimeNow()
    }
  }

  toDTO(imageMetadataRecord: ImageMetadataDatabaseSchema): ImageMetadataDTO {
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
      createdAt: imageMetadataRecord.createdAt,
      updatedAt: imageMetadataRecord.updatedAt
    }
  }

  toDomainEntity(imageMetadataRecord: ImageMetadataDatabaseSchema): ImageMetadata {
    return new ImageMetadata(this.toDTO(imageMetadataRecord))
  }
}
