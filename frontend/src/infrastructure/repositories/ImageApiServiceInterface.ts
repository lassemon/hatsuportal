import { FetchOptions, ImageResponseDTO } from '@hatsuportal/application'
import { Image } from '@hatsuportal/domain'

export interface ImageApiServiceInterface {
  findById(imageId?: string, options?: FetchOptions): Promise<ImageResponseDTO>
  create(metadata: Image, options?: FetchOptions): Promise<ImageResponseDTO>
  delete(imageId: string, options?: FetchOptions): Promise<ImageResponseDTO>
}
