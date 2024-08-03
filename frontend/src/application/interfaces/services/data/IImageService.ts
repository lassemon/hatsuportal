import { FetchOptions } from '@hatsuportal/contracts'
import { ImageViewModel } from 'ui/features/image/viewModels/ImageViewModel'

export interface IImageService {
  findById(imageId?: string, options?: FetchOptions): Promise<ImageViewModel>
  create(metadata: ImageViewModel, options?: FetchOptions): Promise<ImageViewModel>
  delete(imageId: string, options?: FetchOptions): Promise<ImageViewModel>
}
