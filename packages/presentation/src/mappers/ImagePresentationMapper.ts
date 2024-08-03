import { CreateImageInputDTO, ImageDTO, RemoveImageFromStoryInputDTO, UpdateImageInputDTO } from '@hatsuportal/application'
import { ImageResponse } from '../api/responses/ImageResponse'
import { CreateImageRequest } from '../api/requests/CreateImageRequest'
import { UpdateImageRequest } from '../api/requests/UpdateImageRequest'
import _ from 'lodash'
import { InvalidRequestError } from '../errors/InvalidRequestError'
import { PostTypeEnum, validateAndCastEnum, VisibilityEnum } from '@hatsuportal/common'
import { ImagePresentation, ImagePresentationDTO } from '../entities/ImagePresentation'

export interface IImagePresentationMapper {
  toCreateImageInputDTO(createImageRequest: CreateImageRequest, loggedInUserId?: string): CreateImageInputDTO
  toUpdateImageInputDTO(updateImageRequest: UpdateImageRequest, loggedInUserId?: string): UpdateImageInputDTO
  toRemoveImageFromStoryInputDTO(storyIdFromWhichToRemoveImage?: string, loggedInUserId?: string): RemoveImageFromStoryInputDTO
  toResponse(image: ImageDTO): ImageResponse
  toImagePresentationDTO(response: ImageResponse): ImagePresentationDTO
  toImagePresentation(response: ImageResponse): ImagePresentation
}

export class ImagePresentationMapper implements IImagePresentationMapper {
  public toCreateImageInputDTO(createImageRequest: CreateImageRequest, loggedInUserId?: string): CreateImageInputDTO {
    if (!loggedInUserId) {
      throw new InvalidRequestError('Invalid user authentication data.')
    }
    if (!createImageRequest.ownerType) {
      throw new InvalidRequestError('Cannot create an image without an Owner Type.')
    }

    return {
      loggedInUserId,
      createImageData: {
        visibility: validateAndCastEnum(createImageRequest.visibility, VisibilityEnum),
        fileName: createImageRequest.fileName,
        mimeType: createImageRequest.mimeType,
        size: createImageRequest.size,
        ownerId: createImageRequest.ownerId ?? null,
        ownerType: validateAndCastEnum(createImageRequest.ownerType, PostTypeEnum),
        base64: createImageRequest.base64
      }
    }
  }

  public toUpdateImageInputDTO(updateImageRequest: UpdateImageRequest, loggedInUserId?: string): UpdateImageInputDTO {
    if (!loggedInUserId) {
      throw new InvalidRequestError('Invalid user authentication data.')
    }
    if (!updateImageRequest.ownerType) {
      throw new InvalidRequestError('Cannot create an image without an Owner Type.')
    }

    return {
      loggedInUserId,
      updateImageData: {
        id: updateImageRequest.id,
        visibility: updateImageRequest.visibility ? validateAndCastEnum(updateImageRequest.visibility, VisibilityEnum) : undefined,
        fileName: updateImageRequest.fileName,
        mimeType: updateImageRequest.mimeType,
        size: updateImageRequest.size,
        ownerId: updateImageRequest.ownerId ?? null,
        ownerType: updateImageRequest.ownerType ? validateAndCastEnum(updateImageRequest.ownerType, PostTypeEnum) : undefined,
        base64: updateImageRequest.base64
      }
    }
  }

  public toRemoveImageFromStoryInputDTO(storyIdFromWhichToRemoveImage: string, loggedInUserId?: string): RemoveImageFromStoryInputDTO {
    if (!loggedInUserId) {
      throw new InvalidRequestError('Invalid user authentication data.')
    }

    if (!storyIdFromWhichToRemoveImage) {
      throw new InvalidRequestError('Missing required path parameter "storyId"')
    }

    return {
      loggedInUserId,
      storyIdFromWhichToRemoveImage
    }
  }

  public toResponse(image: ImageDTO): ImageResponse {
    return {
      id: image.id,
      visibility: image.visibility,
      createdBy: image.createdBy,
      createdByUserName: image.createdByUserName,
      createdAt: image.createdAt,
      updatedAt: image.updatedAt,
      fileName: image.fileName,
      mimeType: image.mimeType,
      size: image.size,
      ownerId: image.ownerId,
      ownerType: image.ownerType,
      base64: image.base64
    }
  }

  public toImagePresentationDTO(response: ImageResponse): ImagePresentationDTO {
    return {
      id: response.id,
      visibility: validateAndCastEnum(response.visibility, VisibilityEnum),
      createdBy: response.createdBy,
      createdByUserName: response.createdByUserName,
      createdAt: response.createdAt,
      updatedAt: response.updatedAt,
      fileName: response.fileName,
      mimeType: response.mimeType,
      size: response.size,
      ownerId: response.ownerId ?? '',
      ownerType: validateAndCastEnum(response.ownerType, PostTypeEnum),
      base64: response.base64
    }
  }

  public toImagePresentation(response: ImageResponse): ImagePresentation {
    return new ImagePresentation(this.toImagePresentationDTO(response))
  }
}
