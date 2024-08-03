import { FetchOptions, ImageResponse } from '@hatsuportal/contracts'
import { ImageViewModel } from 'ui/features/image/viewModels/ImageViewModel'

export interface IImageHttpClient {
  findById(imageId?: string, options?: FetchOptions): Promise<ImageResponse>
  create(metadata: ImageViewModel, options?: FetchOptions): Promise<ImageResponse>
  delete(imageId: string, options?: FetchOptions): Promise<ImageResponse>
}
