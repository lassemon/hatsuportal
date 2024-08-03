import { EntityLoadResult } from '@hatsuportal/platform'
import { Image, ImageId } from '../../domain'
import { ImageLoadError } from '../../domain/errors/ImageLoadError'

export interface IResilientImageFetchService {
  loadImageSafely(imageId: ImageId): Promise<EntityLoadResult<Image, ImageLoadError>>
  loadImagesSafely(imageIds: ImageId[]): Promise<Map<string, EntityLoadResult<Image, ImageLoadError>>>
}

export default IResilientImageFetchService
