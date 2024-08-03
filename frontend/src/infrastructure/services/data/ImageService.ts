import { FetchOptions, IImagePresentationMapper, ImagePresentation } from '@hatsuportal/presentation'
import { IImageHttpClient, IImageService } from 'application'

export class ImageService implements IImageService {
  constructor(private readonly imageHttpClient: IImageHttpClient, private readonly imagePresentationMapper: IImagePresentationMapper) {}

  public async findById(imageId?: string, options?: FetchOptions): Promise<ImagePresentation> {
    const response = await this.imageHttpClient.findById(imageId, options)
    return this.imagePresentationMapper.toImagePresentation(response)
  }

  public async create(image: ImagePresentation, options?: FetchOptions): Promise<ImagePresentation> {
    const response = await this.imageHttpClient.create(image, options)
    return this.imagePresentationMapper.toImagePresentation(response)
  }

  public async delete(imageId: string, options?: FetchOptions): Promise<ImagePresentation> {
    const response = await this.imageHttpClient.delete(imageId, options)
    return this.imagePresentationMapper.toImagePresentation(response)
  }
}
