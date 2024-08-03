import { FetchOptions } from '@hatsuportal/contracts'
import { IImageHttpClient, IImageService, IImageViewModelMapper } from 'application/interfaces'
import { ImageViewModel } from 'ui/features/image/viewModels/ImageViewModel'

export class ImageService implements IImageService {
  constructor(private readonly imageHttpClient: IImageHttpClient, private readonly imageViewModelMapper: IImageViewModelMapper) {}

  public async findById(imageId: string, options?: FetchOptions): Promise<ImageViewModel> {
    const response = await this.imageHttpClient.findById(imageId, options)
    return this.imageViewModelMapper.toViewModel(response)
  }
}
