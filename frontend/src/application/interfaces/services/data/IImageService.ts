import { FetchOptions, UpdateImageRequest } from '@hatsuportal/contracts'
import { EntityTypeEnum, ImageRoleEnum } from '@hatsuportal/common'
import { ImageViewModel } from 'ui/features/image/viewModels/ImageViewModel'

export interface IImageService {
  findById(imageId?: string, options?: FetchOptions): Promise<ImageViewModel>
  create(
    metadata: ImageViewModel,
    ownerEntityType: EntityTypeEnum,
    ownerEntityId: string,
    role: ImageRoleEnum,
    options?: FetchOptions
  ): Promise<ImageViewModel>
  update(imageId: string, image: UpdateImageRequest, options?: FetchOptions): Promise<ImageViewModel>
  delete(imageId: string, options?: FetchOptions): Promise<ImageViewModel>
}
