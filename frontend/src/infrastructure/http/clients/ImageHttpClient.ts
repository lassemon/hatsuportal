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

  /**
   * Creates a new image.
   * Always HTTP POST, images are always created and never updated.
   *
   * @param image - The image to create.
   * @param ownerEntityType - The type of the entity that owns the image.
   * @param ownerEntityId - The id of the entity that owns the image.
   * @param role - The role of the image.
   * @param options - The options for the request.
   * @returns The created image.
   */
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
