import { FetchOptions, UpdateImageRequest } from '@hatsuportal/contracts'
import { EntityTypeEnum, ImageRoleEnum } from '@hatsuportal/common'
import { IImageHttpClient, IImageService, IImageViewModelMapper } from 'application/interfaces'
import { ImageViewModel } from 'ui/features/image/viewModels/ImageViewModel'

export class ImageService implements IImageService {
  constructor(private readonly imageHttpClient: IImageHttpClient, private readonly imageViewModelMapper: IImageViewModelMapper) {}

  public async findById(imageId?: string, options?: FetchOptions): Promise<ImageViewModel> {
    const response = await this.imageHttpClient.findById(imageId, options)
    return this.imageViewModelMapper.toViewModel(response)
  }

  public async create(
    image: ImageViewModel,
    ownerEntityType: EntityTypeEnum,
    ownerEntityId: string,
    role: ImageRoleEnum,
    options?: FetchOptions
  ): Promise<ImageViewModel> {
    const response = await this.imageHttpClient.create(image, ownerEntityType, ownerEntityId, role, options)
    return this.imageViewModelMapper.toViewModel(response)
  }

  public async update(imageId: string, image: UpdateImageRequest, options?: FetchOptions): Promise<ImageViewModel> {
    const response = await this.imageHttpClient.update(imageId, image, options)
    return this.imageViewModelMapper.toViewModel(response)
  }

  public async delete(imageId: string, options?: FetchOptions): Promise<ImageViewModel> {
    const response = await this.imageHttpClient.delete(imageId, options)
    return this.imageViewModelMapper.toViewModel(response)
  }
}
