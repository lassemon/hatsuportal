import { FetchOptions } from '@hatsuportal/contracts'
import { ImageViewModel } from 'ui/entities/image/model/ImageViewModel'

export interface IImageService {
  findById(imageId: string, options?: FetchOptions): Promise<ImageViewModel>
}
