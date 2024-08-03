import { unixtimeNow, uuid } from '@hatsuportal/common'
import { Image } from '../../domain'
import { IImageFactory } from '../services/ImageFactory'
import { CreateImageInputDTO } from '../dtos/CreateImageInputDTO'
import { ImageDTO } from '../dtos/ImageDTO'

export interface IImageApplicationMapper {
  toDTO(image: Image): ImageDTO
  dtoToDomainEntity(dto: ImageDTO, base64: string): Image
  createInputToDomainEntity(createImageInput: CreateImageInputDTO, createdById: string, createdByName: string): Image
}

export class ImageApplicationMapper implements IImageApplicationMapper {
  constructor(private readonly imageFactory: IImageFactory) {}

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

  public dtoToDomainEntity(dto: ImageDTO, base64: string): Image {
    return Image.reconstruct({ ...dto, base64 })
  }

  public createInputToDomainEntity(createImageInput: CreateImageInputDTO, createdById: string, createdByName: string): Image {
    const { createImageData } = createImageInput
    const now = unixtimeNow()

    const result = this.imageFactory.createImage({
      id: uuid(),
      fileName: createImageData.fileName,
      mimeType: createImageData.mimeType,
      size: createImageData.size,
      ownerEntityId: createImageData.ownerEntityId,
      ownerEntityType: createImageData.ownerEntityType,
      base64: createImageData.base64,
      createdById: createdById,
      createdByName: createdByName,
      createdAt: now,
      updatedAt: now
    })

    if (result.isFailure()) {
      throw result.error
    }

    return result.value
  }
}
