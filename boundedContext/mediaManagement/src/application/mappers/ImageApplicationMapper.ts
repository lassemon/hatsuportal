import { ImageWithRelationsDTO } from '../dtos'
import { ImageDTO } from '../dtos/ImageDTO'
import { CurrentImage } from '../../domain/entities/CurrentImage'

export interface IImageApplicationMapper {
  toDTO(image: CurrentImage): ImageDTO
  toDTOWithRelations(image: CurrentImage, createdByName: string): ImageWithRelationsDTO
}

export class ImageApplicationMapper implements IImageApplicationMapper {
  constructor() {}

  public toDTO(image: CurrentImage): ImageDTO {
    return {
      id: image.id.value,
      storageKey: image.storageKey.value,
      mimeType: image.mimeType.value,
      size: image.size.value,
      base64: image.base64.value,
      currentVersionId: image.currentVersionId.value,
      isCurrent: true,
      isStaged: false,
      createdById: image.createdById.value,
      createdAt: image.createdAt.value,
      updatedAt: image.updatedAt.value
    }
  }

  public toDTOWithRelations(image: CurrentImage, createdByName: string): ImageWithRelationsDTO {
    return {
      id: image.id.value,
      storageKey: image.storageKey.value,
      mimeType: image.mimeType.value,
      size: image.size.value,
      base64: image.base64.value,
      currentVersionId: image.currentVersionId.value,
      isCurrent: true,
      isStaged: false,
      createdById: image.createdById.value,
      createdByName: createdByName,
      createdAt: image.createdAt.value,
      updatedAt: image.updatedAt.value
    }
  }
}
