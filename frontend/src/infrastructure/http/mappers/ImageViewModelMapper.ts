import { IImageViewModelMapper } from 'application/interfaces'
import { ImageWithRelationsResponse } from '@hatsuportal/contracts'
import { ImageViewModel, ImageViewModelDTO } from 'ui/entities/image/model/ImageViewModel'

export class ImageViewModelMapper implements IImageViewModelMapper {
  public toDTO(response: ImageWithRelationsResponse): ImageViewModelDTO {
    return {
      id: response.id,
      createdById: response.createdById,
      createdByName: response.createdByName,
      createdAt: response.createdAt,
      updatedAt: response.updatedAt,
      mimeType: response.mimeType,
      size: response.size,
      base64: response.base64
    }
  }
  public toViewModel(response: ImageWithRelationsResponse): ImageViewModel {
    return new ImageViewModel(this.toDTO(response))
  }
}
