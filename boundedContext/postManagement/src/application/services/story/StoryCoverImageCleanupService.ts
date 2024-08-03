import { NotFoundError } from '@hatsuportal/platform'
import { IMediaGateway } from '../../acl/mediaManagement/IMediaGateway'
import { IStoryReadRepository } from '../../read/IStoryReadRepository'
import { PostId } from '../../../domain'

export interface IStoryCoverImageCleanupService {
  deleteCoverImageIfUnreferenced(imageId: string, deletedById: string): Promise<void>
}

export class StoryCoverImageCleanupService implements IStoryCoverImageCleanupService {
  constructor(
    private readonly storyReadRepository: IStoryReadRepository,
    private readonly mediaGateway: IMediaGateway
  ) {}

  async deleteCoverImageIfUnreferenced(imageId: string, deletedById: string): Promise<void> {
    const referencingStories = await this.storyReadRepository.findByImageId(new PostId(imageId))
    if (referencingStories.length > 0) {
      return
    }

    try {
      await this.mediaGateway.deleteImage({ deletedById, imageId })
    } catch (error) {
      if (error instanceof NotFoundError) {
        return
      }
      throw error
    }
  }
}
