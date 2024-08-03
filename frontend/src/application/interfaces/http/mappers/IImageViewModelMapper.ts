import { ImageWithRelationsResponse } from '@hatsuportal/contracts'
import { ImageViewModel } from 'ui/entities/image/model/ImageViewModel'

export interface IImageViewModelMapper {
  toViewModel(response: ImageWithRelationsResponse): ImageViewModel
}
