import { Image, ImageId, ImageLoadResult } from '../../domain'
import { ImageLoadError } from '../../domain/entities/ImageLoadError'

export interface IResilientImageFetchService {
  loadImageSafely(imageId: ImageId): Promise<ImageLoadResult<Image, ImageLoadError>>
  loadImagesSafely(imageIds: ImageId[]): Promise<Map<string, ImageLoadResult<Image, ImageLoadError>>>
}

export default IResilientImageFetchService
