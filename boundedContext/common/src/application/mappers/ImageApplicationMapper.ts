import { Image } from '../../domain'
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
      ownerEntityId: image.ownerEntityId.value,
      ownerEntityType: image.ownerEntityType.value,
      base64: image.base64.value,
      createdById: image.createdById.value,
      createdByName: image.createdByName.value,
      createdAt: image.createdAt.value,
      updatedAt: image.updatedAt.value
    }
  }

  public toDomainEntity(dto: ImageDTO, base64: string): Image {
    return Image.reconstruct({ ...dto, base64 })
  }
}
