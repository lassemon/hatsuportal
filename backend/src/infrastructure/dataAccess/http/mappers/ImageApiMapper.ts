import { CreateImageRequest, UpdateImageRequest, ImageResponse } from '@hatsuportal/contracts'
import { CreateImageInputDTO, UpdateImageInputDTO, ImageDTO } from '@hatsuportal/common-bounded-context'
import { EntityTypeEnum, validateAndCastEnum } from '@hatsuportal/common'

import { IImageApiMapper } from 'application/dataAccess/http/mappers/IImageApiMapper'
import { InvalidRequestError } from 'infrastructure/errors/InvalidRequestError'

export class ImageApiMapper implements IImageApiMapper {
  public toCreateImageInputDTO(createImageRequest: CreateImageRequest, loggedInUserId?: string): CreateImageInputDTO {
    if (!loggedInUserId) {
      throw new InvalidRequestError('Invalid user authentication data.')
    }
    if (!createImageRequest.ownerEntityType) {
      throw new InvalidRequestError('Cannot create an image without an Owner Type.')
    }

    return {
      loggedInUserId,
      createImageData: {
        fileName: createImageRequest.fileName,
        mimeType: createImageRequest.mimeType,
        size: createImageRequest.size,
        ownerEntityId: createImageRequest.ownerEntityId,
        ownerEntityType: validateAndCastEnum(createImageRequest.ownerEntityType, EntityTypeEnum),
        base64: createImageRequest.base64
      }
    }
  }

  public toUpdateImageInputDTO(updateImageRequest: UpdateImageRequest, loggedInUserId?: string): UpdateImageInputDTO {
    if (!loggedInUserId) {
      throw new InvalidRequestError('Invalid user authentication data.')
    }
    if (!updateImageRequest.ownerEntityType) {
      throw new InvalidRequestError('Cannot create an image without an Owner Type.')
    }

    return {
      loggedInUserId,
      updateImageData: {
        id: updateImageRequest.id,
        fileName: updateImageRequest.fileName,
        mimeType: updateImageRequest.mimeType,
        size: updateImageRequest.size,
        ownerEntityId: updateImageRequest.ownerEntityId,
        ownerEntityType: validateAndCastEnum(updateImageRequest.ownerEntityType, EntityTypeEnum),
        base64: updateImageRequest.base64
      }
    }
  }

  public toResponse(image: ImageDTO): ImageResponse {
    return {
      id: image.id,
      createdById: image.createdById,
      createdByName: image.createdByName,
      createdAt: image.createdAt,
      updatedAt: image.updatedAt,
      fileName: image.fileName,
      mimeType: image.mimeType,
      size: image.size,
      ownerEntityId: image.ownerEntityId,
      ownerEntityType: image.ownerEntityType,
      base64: image.base64
    }
  }
}
