import { ImageWithRelationsResponse } from '@hatsuportal/contracts'
import { ImageViewModel, ImageViewModelDTO } from 'ui/entities/image/model/ImageViewModel'

export interface IImageViewModelMapper {
  toDTO(response: ImageWithRelationsResponse): ImageViewModelDTO
  toViewModel(response: ImageWithRelationsResponse): ImageViewModel
}
