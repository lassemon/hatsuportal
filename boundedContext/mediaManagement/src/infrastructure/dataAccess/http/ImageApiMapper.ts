import { ImageResponse, ImageWithRelationsResponse } from '@hatsuportal/contracts'
import { ImageDTO, ImageWithRelationsDTO } from '../../../application/dtos'
import { IImageApiMapper } from '../../../application/dataAccess/http/IImageApiMapper'

export class ImageApiMapper implements IImageApiMapper {
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
