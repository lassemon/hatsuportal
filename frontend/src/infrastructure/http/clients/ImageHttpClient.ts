import { CreateImageRequest, FetchOptions, ImageWithRelationsResponse, UpdateImageRequest } from '@hatsuportal/contracts'
import { EntityTypeEnum, ImageRoleEnum } from '@hatsuportal/common'
import { IHttpClient, IImageHttpClient } from 'application/interfaces'
import { ImageViewModel } from 'ui/features/image/viewModels/ImageViewModel'

export class ImageHttpClient implements IImageHttpClient {
  private readonly baseUrl = '/images'
  constructor(private readonly httpClient: IHttpClient) {}

  async findById(imageId: string, options?: FetchOptions): Promise<ImageWithRelationsResponse> {
    return await this.httpClient.getJson<ImageWithRelationsResponse, undefined>({
      endpoint: `${this.baseUrl}/${imageId ? imageId : ''}`,
      ...options
    })
  }

  // TODO: differentiate between post and put on images?
  // it might not be sensible if images metadata in database is always replaced with a new id
  // when stored to the filesysem.
  // aka are images always created and never updated?
  async create(
    image: ImageViewModel,
    ownerEntityType: EntityTypeEnum,
    ownerEntityId: string,
    role: ImageRoleEnum,
    options?: FetchOptions
  ): Promise<ImageWithRelationsResponse> {
    return await this.httpClient.postJson<ImageWithRelationsResponse, CreateImageRequest>({
      endpoint: `${this.baseUrl}`,
      payload: { ...image.toJSON(), ownerEntityType, ownerEntityId, role },
      ...options
    })
  }

  async update(imageId: string, image: UpdateImageRequest, options?: FetchOptions): Promise<ImageWithRelationsResponse> {
    return await this.httpClient.patchJson<ImageWithRelationsResponse, UpdateImageRequest>({
      endpoint: `${this.baseUrl}/${imageId}`,
      payload: image,
      ...options
    })
  }

  async delete(imageId: string, options?: FetchOptions): Promise<ImageWithRelationsResponse> {
    return await this.httpClient.deleteJson<ImageWithRelationsResponse, undefined>({
      endpoint: `${this.baseUrl}/${imageId ? imageId : ''}`,
      ...options
    })
  }
}
