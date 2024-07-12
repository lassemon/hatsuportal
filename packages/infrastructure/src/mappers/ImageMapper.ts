import { Image, ImageDTO, ImageMetadata, ImageMetadataDTO, User } from '@hatsuportal/domain'
import { NotMutableUpdateProperties, OmitNotMutableUpdateProperties, PartialExceptFor, unixtimeNow, uuid } from '@hatsuportal/common'
import {
  CreateImageRequestDTO,
  ImageMapperInterface,
  ImageResponseDTO,
  InsertImageMetadataQueryDTO,
  UpdateImageMetadataQueryDTO,
  UpdateImageRequestDTO
} from '@hatsuportal/application'
import _ from 'lodash'

export class ImageMapper implements ImageMapperInterface {
  public createRequestToImageMetadata(createRequest: CreateImageRequestDTO, user: User): ImageMetadata {
    const imageBlueprint: ImageMetadataDTO = {
      id: uuid(),
      visibility: createRequest.visibility,
      fileName: createRequest.fileName,
      mimeType: createRequest.mimeType,
      size: createRequest.size,
      ownerId: createRequest.ownerId,
      ownerType: createRequest.ownerType,
      createdBy: user.id,
      createdByUserName: user.name,
      createdAt: unixtimeNow(),
      updatedAt: null
    }
    return new ImageMetadata(imageBlueprint)
  }

  updateRequestToImageMetadata(existingImageMetadata: ImageMetadataDTO, updateImageRequest: UpdateImageRequestDTO): ImageMetadata {
    const cleanedUpdate = _.omit(updateImageRequest, [...NotMutableUpdateProperties, 'updatedAt', 'base64'])
    // easiest to use lodash merge here to avoid undefined members in updateRequest overwriting existing data to undefined
    return new ImageMetadata(_.merge({}, existingImageMetadata, cleanedUpdate))
  }

  public toInsertQuery(imageMetadata: ImageMetadataDTO): InsertImageMetadataQueryDTO {
    const imageMetadataInsert = {
      id: imageMetadata.id,
      visibility: imageMetadata.visibility,
      fileName: imageMetadata.fileName,
      mimeType: imageMetadata.mimeType,
      size: imageMetadata.size,
      ownerId: imageMetadata.ownerId,
      ownerType: imageMetadata.ownerType,
      createdBy: imageMetadata.createdBy,
      createdByUserName: imageMetadata.createdByUserName,
      createdAt: imageMetadata.createdAt,
      updatedAt: null
    }
    return imageMetadataInsert
  }

  public toUpdateQuery(
    imageMetadata: PartialExceptFor<OmitNotMutableUpdateProperties<ImageMetadataDTO>, 'id'>
  ): UpdateImageMetadataQueryDTO {
    const updatedAt = unixtimeNow()
    return {
      id: imageMetadata.id,
      visibility: imageMetadata.visibility,
      fileName: imageMetadata.fileName,
      mimeType: imageMetadata.mimeType,
      size: imageMetadata.size,
      ownerId: imageMetadata.ownerId,
      ownerType: imageMetadata.ownerType,
      updatedAt: updatedAt
    }
  }

  public toImageMetadata(imageMetadataDTO: ImageMetadataDTO): ImageMetadata {
    return new ImageMetadata(imageMetadataDTO)
  }

  public metadataToImage(imageMetadata: ImageMetadataDTO, base64: string): Image {
    const ImageDTO: ImageDTO = {
      ...imageMetadata,
      base64
    }
    return new Image(ImageDTO)
  }

  public toResponse(image: ImageDTO): ImageResponseDTO {
    return { ...image }
  }
}
