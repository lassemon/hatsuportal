import { IUseCase, IUseCaseOptions } from '@hatsuportal/platform'
import { DeleteStoryInputDTO, StoryDTO } from '../../../dtos'
import { CoverImageId, IStoryWriteRepository, PostId, Story } from '../../../../domain'
import { UniqueId, UnixTimestamp } from '@hatsuportal/shared-kernel'
import { ConcurrencyError, IUnitOfWork } from '@hatsuportal/platform'
import { IStoryApplicationMapper } from '../../../mappers/StoryApplicationMapper'
import { IStoryReadRepository } from '../../../read/IStoryReadRepository'
import { IStoryCoverImageCleanupService } from '../../../services/story/StoryCoverImageCleanupService'

export interface IDeleteStoryUseCaseOptions extends IUseCaseOptions {
  deletedById: string
  deleteStoryInput: DeleteStoryInputDTO
  storyDeleted(deletedStory: StoryDTO): void
  deleteConflict(error: ConcurrencyError<Story>): void
}

export type IDeleteStoryUseCase = IUseCase<IDeleteStoryUseCaseOptions>

export class DeleteStoryUseCase implements IDeleteStoryUseCase {
  constructor(
    private readonly storyRepository: IStoryWriteRepository,
    private readonly storyReadRepository: IStoryReadRepository,
    private readonly storyMapper: IStoryApplicationMapper,
    private readonly storyCoverImageCleanupService: IStoryCoverImageCleanupService,
    private readonly unitOfWork: IUnitOfWork<PostId, UnixTimestamp>
  ) {}

  async execute({ deletedById, deleteStoryInput, storyDeleted, deleteConflict }: IDeleteStoryUseCaseOptions): Promise<void> {
    const deletedBy = new UniqueId(deletedById)
    let removedCoverImageId: string | null = null

    try {
      const [deletedStory] = await this.unitOfWork.execute<[Story]>(async () => {
        const { storyIdToDelete } = deleteStoryInput

        // Story to delete is not null because we already checked for it in the validation
        const storyToDelete = await this.storyRepository.findByIdForUpdate(new PostId(storyIdToDelete))

        if (!storyToDelete!.coverImageId.equals(CoverImageId.NOT_SET)) {
          removedCoverImageId = storyToDelete!.coverImageId.value
          storyToDelete!.updateCoverImage(CoverImageId.NOT_SET, deletedBy)
        }

        storyToDelete!.setNewTags([], deletedBy) // remove tags from entity

        await this.storyRepository.delete(storyToDelete!)

        storyToDelete!.delete(new UniqueId(deletedById))
        return [storyToDelete!]
      })

      if (removedCoverImageId) {
        await this.storyCoverImageCleanupService.deleteCoverImageIfUnreferenced(removedCoverImageId, deletedById)
      }

      this.storyReadRepository.invalidateById(new PostId(deleteStoryInput.storyIdToDelete))

      storyDeleted(this.storyMapper.toDTO(deletedStory))
    } catch (error) {
      if (error instanceof ConcurrencyError) {
        deleteConflict(error)
        return
      }
      throw error
    }
  }
}
