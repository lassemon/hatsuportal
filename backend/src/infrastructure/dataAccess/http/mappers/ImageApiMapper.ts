import { CreateImageRequest, UpdateImageRequest, ImageResponse, ImageWithRelationsResponse } from '@hatsuportal/contracts'

import { IImageApiMapper } from '../../../../application/dataAccess'
import { InvalidRequestError } from '../../../../infrastructure/errors/InvalidRequestError'
import { CreateImageInputDTO, ImageDTO, ImageWithRelationsDTO, UpdateImageInputDTO } from '@hatsuportal/media-management'

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
