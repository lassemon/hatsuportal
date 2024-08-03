import { CreateImageRequest, ImagePresentation, ImageResponse } from '@hatsuportal/presentation-common'
import { FetchOptions } from '@hatsuportal/presentation-common'
import { IHttpClient, IImageHttpClient } from 'application'

// FIXME: REMOVE THIS FILE, SEPARATE IMAGE HTTP ENDPOINT NOT NEEDED YET

export class ImageHttpClient implements IImageHttpClient {
  constructor(private readonly httpClient: IHttpClient) {}

  async findById(imageId: string, options?: FetchOptions): Promise<ImageResponse> {
    return await this.httpClient.getJson<ImageResponse, undefined>({
      ...{ endpoint: `/image/${imageId ? imageId : ''}` },
      ...options
    })
  }

  // TODO: differentiate between post and put on images?
  // it might not be sensible if images metadata in database is always replaced with a new id
  // when stored to the filesysem.
  // aka are images always created and never updated?
  async create(image: ImagePresentation, options?: FetchOptions): Promise<ImageResponse> {
    return await this.httpClient.postJson<ImageResponse, CreateImageRequest>({
      ...{ endpoint: '/image', payload: image.toJSON() },
      ...options
    })
  }

  async delete(imageId: string, options?: FetchOptions): Promise<ImageResponse> {
    return await this.httpClient.deleteJson<ImageResponse, undefined>({
      ...{ endpoint: `/image/${imageId ? imageId : ''}` },
      ...options
    })
  }
}
