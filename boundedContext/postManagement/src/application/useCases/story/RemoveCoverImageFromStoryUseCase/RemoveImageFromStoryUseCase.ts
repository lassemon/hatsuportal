import { IUseCase, IUseCaseOptions, NotFoundError, ITransactionManager, ITransactionAware } from '@hatsuportal/platform'
import { UnixTimestamp } from '@hatsuportal/shared-kernel'
import { RemoveImageFromStoryInputDTO, StoryWithRelationsDTO } from '../../../dtos'
import { IStoryWriteRepository, PostId, Story } from '../../../../domain'
import { IStoryLookupService } from '../../../services/story/StoryLookupService'
import { IMediaGateway } from '../../../acl/mediaManagement/IMediaGateway'

export interface IRemoveImageFromStoryUseCaseOptions extends IUseCaseOptions {
  removedById: string
  removeImageFromStoryInput: RemoveImageFromStoryInputDTO
  imageRemoved(storyWithoutImage: StoryWithRelationsDTO): void
}

// TODO, rename to RemoveCoverImageFromStoryUseCase

export type IRemoveImageFromStoryUseCase = IUseCase<IRemoveImageFromStoryUseCaseOptions>

export class RemoveImageFromStoryUseCase implements IRemoveImageFromStoryUseCase {
  constructor(
    private readonly storyRepository: IStoryWriteRepository & ITransactionAware,
    private readonly mediaGateway: IMediaGateway,
    private readonly storyLookupService: IStoryLookupService,
    private readonly transactionManager: ITransactionManager<PostId, UnixTimestamp>
  ) {}

  async execute({ removedById, removeImageFromStoryInput, imageRemoved }: IRemoveImageFromStoryUseCaseOptions): Promise<void> {
    const { storyIdFromWhichToRemoveImage } = removeImageFromStoryInput

    const existingStory = await this.storyRepository.findByIdForUpdate(new PostId(storyIdFromWhichToRemoveImage))

    if (existingStory === null) {
      throw new NotFoundError(
        `Failed to remove image from story with id ${storyIdFromWhichToRemoveImage} because the story does not exist.`
      )
    }

    const [updatedStory] = await this.transactionManager.execute<[Story]>(async () => {
      // nothing to do → exit early
      if (!existingStory.coverImageId) return [existingStory]

      await this.mediaGateway.deleteImage({ imageId: existingStory.coverImageId.value, deletedById: removedById })
      await this.storyRepository.update(existingStory)

      existingStory.updateCoverImage(null)

      return [existingStory]
    }, [this.storyRepository])

    const dtoWithRelations = await this.storyLookupService.findById(updatedStory.id)

    if (!dtoWithRelations) {
      throw new NotFoundError('Story updated but not found in lookup service.')
    }

    imageRemoved(dtoWithRelations)
  }
}
