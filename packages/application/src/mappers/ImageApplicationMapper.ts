import { Image } from '@hatsuportal/domain'
import { ImageDTO } from '../dtos/ImageDTO'

export interface IImageApplicationMapper {
  toDTO(image: Image): ImageDTO
  toDomainEntity(dto: ImageDTO, base64: string): Image
}

export class ImageApplicationMapper implements IImageApplicationMapper {
  public toDTO(image: Image): ImageDTO {
    return {
      id: image.id.value,
      fileName: image.fileName.value,
      mimeType: image.mimeType.value,
      size: image.size.value,
      ownerId: image.ownerId?.value ?? null,
      ownerType: image.ownerType?.value ?? null,
      base64: image.base64.value,
      visibility: image.visibility.value,
      createdBy: image.createdBy.value,
      createdByUserName: image.createdByUserName.value,
      createdAt: image.createdAt.value,
      updatedAt: image.updatedAt?.value ?? null
    }
  }

  public toDomainEntity(dto: ImageDTO, base64: string): Image {
    return new Image({ ...dto, base64 })
  }
}
