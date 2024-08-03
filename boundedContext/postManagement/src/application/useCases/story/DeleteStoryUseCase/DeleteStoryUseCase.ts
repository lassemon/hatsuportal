import { ITransactionManager, IUseCase, IUseCaseOptions } from '@hatsuportal/foundation'
import { DeleteStoryInputDTO, StoryDTO } from '../../../dtos'
import { ConcurrencyError } from '@hatsuportal/foundation'
import { IStoryWriteRepository, PostId, Story } from '../../../../domain'
import { IMediaGateway } from '../../../acl/mediaManagement/IMediaGateway'
import { UnixTimestamp } from '@hatsuportal/shared-kernel'
import { IStoryApplicationMapper } from '../../../mappers/StoryApplicationMapper'

export interface IDeleteStoryUseCaseOptions extends IUseCaseOptions {
  deletedById: string
  deleteStoryInput: DeleteStoryInputDTO
  storyDeleted(deletedStory: StoryDTO): void
  deleteConflict(error: ConcurrencyError<Story>): void
}

export type IDeleteStoryUseCase = IUseCase<IDeleteStoryUseCaseOptions>

export class DeleteStoryUseCase implements IDeleteStoryUseCase {
  constructor(
    private readonly mediaGateway: IMediaGateway,
    private readonly storyRepository: IStoryWriteRepository,
    private readonly storyMapper: IStoryApplicationMapper,
    private readonly transactionManager: ITransactionManager<PostId, UnixTimestamp>
  ) {}

  async execute({ deletedById, deleteStoryInput, storyDeleted, deleteConflict }: IDeleteStoryUseCaseOptions): Promise<void> {
    try {
      const [deletedStory] = await this.transactionManager.execute<[Story]>(async () => {
        const { storyIdToDelete } = deleteStoryInput

        // Story to delete is not null because we already checked for it in the validation
        const storyToDelete = await this.storyRepository.findByIdForUpdate(new PostId(storyIdToDelete))

        if (storyToDelete!.coverImageId) {
          await this.mediaGateway.deleteImage({ imageId: storyToDelete!.coverImageId.value, deletedById })
          storyToDelete!.updateCoverImage(null)
        }

        storyToDelete!.setNewTags([]) // remove tags from entity

        // storyRepository will delete the story and the image if it exists
        await this.storyRepository.delete(storyToDelete!)

        storyToDelete!.delete()
        // returning the story here will trigger transaction manager to commit the transaction
        return [storyToDelete!]
      }, [this.storyRepository])
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
