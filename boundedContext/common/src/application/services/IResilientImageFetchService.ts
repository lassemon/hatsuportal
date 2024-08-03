import { ImageId, ImageLoadResult } from '../../domain'

export interface IResilientImageFetchService {
  loadImageSafely(imageId: ImageId): Promise<ImageLoadResult>
  loadImagesSafely(imageIds: ImageId[]): Promise<Map<string, ImageLoadResult>>
}

export default IResilientImageFetchService
