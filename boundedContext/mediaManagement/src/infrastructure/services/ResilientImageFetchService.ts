import { NotFoundError } from '@hatsuportal/platform'
import { IResilientImageFetchService } from '../../application'
import { IImageRepository, Image, ImageId, ImageLoadError, ImageLoadResult } from '../../domain'

export class ResilientImageFetchService implements IResilientImageFetchService {
  constructor(private readonly imageRepository: IImageRepository) {}

  async loadImageSafely(imageId: ImageId): Promise<ImageLoadResult<Image, ImageLoadError>> {
    try {
      const image = await this.imageRepository.findById(imageId)
      if (image) {
        return ImageLoadResult.success(image)
      } else {
        return ImageLoadResult.failedToLoad(imageId, new NotFoundError(`Image '${imageId.value}' not found`))
      }
    } catch (error) {
      if (error instanceof Error) {
        return ImageLoadResult.failedToLoad(imageId, error)
      } else {
        return ImageLoadResult.failedToLoad(imageId, new Error('Unknown error occurred'))
      }
    }
  }

  async loadImagesSafely(imageIds: ImageId[]): Promise<Map<string, ImageLoadResult<Image, ImageLoadError>>> {
    const results = new Map<string, ImageLoadResult<Image, ImageLoadError>>()

    // Load images in parallel but handle each failure individually
    const promises = imageIds.map(async (imageId) => {
      const result = await this.loadImageSafely(imageId)
      results.set(imageId.value, result)
    })

    // Wait for all promises to settle (both fulfilled and rejected)
    await Promise.allSettled(promises)

    return results
  }
}
