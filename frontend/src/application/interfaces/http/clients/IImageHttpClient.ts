import { FetchOptions, ImageWithRelationsResponse, UpdateImageRequest } from '@hatsuportal/contracts'
import { EntityTypeEnum, ImageRoleEnum } from '@hatsuportal/common'
import { ImageViewModel } from 'ui/features/image/viewModels/ImageViewModel'

export interface IImageHttpClient {
  findById(imageId?: string, options?: FetchOptions): Promise<ImageWithRelationsResponse>
  create(
    metadata: ImageViewModel,
    ownerEntityType: EntityTypeEnum,
    ownerEntityId: string,
    role: ImageRoleEnum,
    options?: FetchOptions
  ): Promise<ImageWithRelationsResponse>
  update(imageId: string, image: UpdateImageRequest, options?: FetchOptions): Promise<ImageWithRelationsResponse>
  delete(imageId: string, options?: FetchOptions): Promise<ImageWithRelationsResponse>
}
