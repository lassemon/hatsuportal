import { FetchOptions } from '@hatsuportal/contracts'
import { ImageViewModel } from 'ui/features/image/viewModels/ImageViewModel'

export interface IImageService {
  findById(imageId: string, options?: FetchOptions): Promise<ImageViewModel>
}
