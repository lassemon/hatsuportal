import { IImageViewModelMapper } from 'application/interfaces'
import { ImageWithRelationsResponse } from '@hatsuportal/contracts'
import { ImageViewModel } from 'ui/features/image/viewModels/ImageViewModel'

export class ImageViewModelMapper implements IImageViewModelMapper {
  public toViewModel(response: ImageWithRelationsResponse): ImageViewModel {
    return new ImageViewModel({
      id: response.id,
      createdById: response.createdById,
      createdByName: response.createdByName,
      createdAt: response.createdAt,
      updatedAt: response.updatedAt,
      mimeType: response.mimeType,
      size: response.size,
      base64: response.base64
    })
  }
}
