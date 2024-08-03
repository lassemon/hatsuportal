import { CreateImageInputDTO, ImageDTO, UpdateImageInputDTO } from '@hatsuportal/common-bounded-context'

import { CreateImageRequest } from '../api/requests/CreateImageRequest'
import { UpdateImageRequest } from '../api/requests/UpdateImageRequest'
import _ from 'lodash'
import { EntityTypeEnum, validateAndCastEnum } from '@hatsuportal/common'

import { ImagePresentation, ImagePresentationDTO } from '../entities/ImagePresentation'
import { ImageResponse } from '../api/responses/ImageResponse'
import { InvalidRequestError } from '../errors/InvalidRequestError'

export interface IImagePresentationMapper {
  toCreateImageInputDTO(createImageRequest: CreateImageRequest, loggedInUserId?: string): CreateImageInputDTO
  toUpdateImageInputDTO(updateImageRequest: UpdateImageRequest, loggedInUserId?: string): UpdateImageInputDTO
  toResponse(image: ImageDTO): ImageResponse
  toImagePresentationDTO(response: ImageResponse): ImagePresentationDTO
  toImagePresentation(response: ImageResponse): ImagePresentation
}

export class ImagePresentationMapper implements IImagePresentationMapper {
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

  public toImagePresentationDTO(response: ImageResponse): ImagePresentationDTO {
    return {
      id: response.id,
      createdById: response.createdById,
      createdByName: response.createdByName,
      createdAt: response.createdAt,
      updatedAt: response.updatedAt,
      fileName: response.fileName,
      mimeType: response.mimeType,
      size: response.size,
      ownerEntityId: response.ownerEntityId,
      ownerEntityType: validateAndCastEnum(response.ownerEntityType, EntityTypeEnum),
      base64: response.base64
    }
  }

  public toImagePresentation(response: ImageResponse): ImagePresentation {
    return new ImagePresentation(this.toImagePresentationDTO(response))
  }
}
