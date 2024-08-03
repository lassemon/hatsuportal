import { FetchOptions, ImagePresentation } from '@hatsuportal/presentation-common'

export interface IImageService {
  findById(imageId?: string, options?: FetchOptions): Promise<ImagePresentation>
  create(metadata: ImagePresentation, options?: FetchOptions): Promise<ImagePresentation>
  delete(imageId: string, options?: FetchOptions): Promise<ImagePresentation>
}
