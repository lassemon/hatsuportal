import { ImageWithRelationsResponse } from '@hatsuportal/contracts'
import { ImageViewModel } from 'ui/features/image/viewModels/ImageViewModel'

export interface IImageViewModelMapper {
  toViewModel(response: ImageWithRelationsResponse): ImageViewModel
}
