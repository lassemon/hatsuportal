import { EntityLoadError, EntityLoadResult, NotFoundError } from '@hatsuportal/platform'
import { IResilientImageFetchService } from '../../application'
import { Image, ImageId } from '../../domain'
import { IImageLookupService } from '../../application/services/image/ImageLookupService'

export class ResilientImageFetchService implements IResilientImageFetchService {
  constructor(private readonly imageLookupService: IImageLookupService) {}

  async loadImageSafely(imageId: ImageId): Promise<EntityLoadResult<Image, EntityLoadError>> {
    try {
      const image = await this.imageLookupService.findById(imageId)
      if (image) {
        return EntityLoadResult.success(image)
      } else {
        return EntityLoadResult.failure(
          new EntityLoadError({ entityId: imageId.value, error: new NotFoundError(`Image '${imageId.value}' not found`) })
        )
      }
    } catch (error) {
      if (error instanceof Error) {
        return EntityLoadResult.failure(new EntityLoadError({ entityId: imageId.value, error }))
      } else {
        return EntityLoadResult.failure(new EntityLoadError({ entityId: imageId.value, error: new Error('Unknown error occurred') }))
      }
    }
  }

  async loadImagesSafely(imageIds: ImageId[]): Promise<Map<string, EntityLoadResult<Image, EntityLoadError>>> {
    const results = new Map<string, EntityLoadResult<Image, EntityLoadError>>()

    const promises = imageIds.map(async (imageId) => {
      const result = await this.loadImageSafely(imageId)
      results.set(imageId.value, result)
    })

    await Promise.allSettled(promises)

    return results
  }
}
