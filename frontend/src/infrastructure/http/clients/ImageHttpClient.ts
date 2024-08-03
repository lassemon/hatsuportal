import { FetchOptions, ImageWithRelationsResponse } from '@hatsuportal/contracts'
import { IHttpClient, IImageHttpClient } from 'application/interfaces'

export class ImageHttpClient implements IImageHttpClient {
  private readonly baseUrl = '/images'
  constructor(private readonly httpClient: IHttpClient) {}

  async findById(imageId: string, options?: FetchOptions): Promise<ImageWithRelationsResponse> {
    return await this.httpClient.getJson<ImageWithRelationsResponse, undefined>({
      endpoint: `${this.baseUrl}/${imageId}`,
      ...options
    })
  }
}
