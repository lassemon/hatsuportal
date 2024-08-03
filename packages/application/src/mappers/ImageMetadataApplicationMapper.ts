import { ImageMetadata } from '@hatsuportal/domain'
import { ImageMetadataDTO } from '../dtos/ImageMetadataDTO'
import _ from 'lodash'

export interface IImageMetadataApplicationMapper {
  toDTO(imageMetadata: ImageMetadata): ImageMetadataDTO
  toDomainEntity(dto: ImageMetadataDTO): ImageMetadata
}

export class ImageMetadataApplicationMapper implements IImageMetadataApplicationMapper {
  public toDTO(imageMetadata: ImageMetadata): ImageMetadataDTO {
    return {
      id: imageMetadata.id.value,
      fileName: imageMetadata.fileName.value,
      mimeType: imageMetadata.mimeType.value,
      size: imageMetadata.size.value,
      ownerId: imageMetadata.ownerId?.value ?? null,
      ownerType: imageMetadata.ownerType.value,
      visibility: imageMetadata.visibility.value,
      createdBy: imageMetadata.createdBy.value,
      createdByUserName: imageMetadata.createdByUserName.value,
      createdAt: imageMetadata.createdAt.value,
      updatedAt: imageMetadata.updatedAt?.value ?? null
    }
  }

  toDomainEntity(dto: ImageMetadataDTO): ImageMetadata {
    return new ImageMetadata(dto)
  }
}
