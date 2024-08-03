import { FetchOptions, ImageWithRelationsResponse } from '@hatsuportal/contracts'

export interface IImageHttpClient {
  findById(imageId: string, options?: FetchOptions): Promise<ImageWithRelationsResponse>
}
