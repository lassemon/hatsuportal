import { FetchOptions, ImagePresentation, ImageResponse } from '@hatsuportal/presentation'

export interface IImageHttpClient {
  findById(imageId?: string, options?: FetchOptions): Promise<ImageResponse>
  create(metadata: ImagePresentation, options?: FetchOptions): Promise<ImageResponse>
  delete(imageId: string, options?: FetchOptions): Promise<ImageResponse>
}
