import { CreateImageRequest, FetchOptions, ImageResponse } from '@hatsuportal/contracts'
import { IHttpClient, IImageHttpClient } from 'application/interfaces'
import { ImageViewModel } from 'ui/features/image/viewModels/ImageViewModel'

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
  async create(image: ImageViewModel, options?: FetchOptions): Promise<ImageResponse> {
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
