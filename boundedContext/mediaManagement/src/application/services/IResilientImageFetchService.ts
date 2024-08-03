import { EntityLoadError, EntityLoadResult } from '@hatsuportal/platform'
import { Image, ImageId } from '../../domain'

export interface IResilientImageFetchService {
  loadImageSafely(imageId: ImageId): Promise<EntityLoadResult<Image, EntityLoadError>>
  loadImagesSafely(imageIds: ImageId[]): Promise<Map<string, EntityLoadResult<Image, EntityLoadError>>>
}

export default IResilientImageFetchService
