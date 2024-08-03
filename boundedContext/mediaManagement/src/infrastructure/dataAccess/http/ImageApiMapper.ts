import { CreateImageRequest, ImageResponse, ImageWithRelationsResponse, UpdateImageRequest } from '@hatsuportal/contracts'
import { CreateImageInputDTO, ImageDTO, ImageWithRelationsDTO, UpdateImageInputDTO } from '../../../application/dtos'
import { IImageApiMapper } from '../../../application/dataAccess/http/IImageApiMapper'
import { InvalidRequestError } from '@hatsuportal/platform'

export class ImageApiMapper implements IImageApiMapper {
  public toCreateImageInputDTO(createImageRequest: CreateImageRequest, loggedInUserId?: string): CreateImageInputDTO {
    if (!loggedInUserId) {
      throw new InvalidRequestError('Invalid user authentication data.')
    }

    return {
      ownerEntityType: createImageRequest.ownerEntityType,
      ownerEntityId: createImageRequest.ownerEntityId,
      role: createImageRequest.role,
      mimeType: createImageRequest.mimeType,
      size: createImageRequest.size,
      base64: createImageRequest.base64
    }
  }

  public toUpdateImageInputDTO(updateImageRequest: UpdateImageRequest, imageId: string, loggedInUserId?: string): UpdateImageInputDTO {
    if (!loggedInUserId) {
      throw new InvalidRequestError('Invalid user authentication data.')
    }

    return {
      id: imageId,
      mimeType: updateImageRequest.mimeType,
      size: updateImageRequest.size,
      base64: updateImageRequest.base64
    }
  }

  public toResponse(image: ImageDTO): ImageResponse {
    return {
      id: image.id,
      createdById: image.createdById,
      createdAt: image.createdAt,
      updatedAt: image.updatedAt,
      mimeType: image.mimeType,
      size: image.size,
      base64: image.base64
    }
  }

  public toResponseWithRelations(image: ImageWithRelationsDTO): ImageWithRelationsResponse {
    return {
      ...this.toResponse(image),
      createdByName: image.createdByName
    }
  }
}
