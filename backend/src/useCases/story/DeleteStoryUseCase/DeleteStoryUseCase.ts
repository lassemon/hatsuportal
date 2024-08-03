import { IImageRepository, ITransactionManager } from '@hatsuportal/common-bounded-context'
import {
  IDeleteStoryUseCase,
  IDeleteStoryUseCaseOptions,
  IStoryApplicationMapper,
  IStoryRepository,
  PostId
} from '@hatsuportal/post-management'

export class DeleteStoryUseCase implements IDeleteStoryUseCase {
  constructor(
    private readonly imageRepository: IImageRepository,
    private readonly storyRepository: IStoryRepository,
    private readonly storyMapper: IStoryApplicationMapper,
    private readonly transactionManager: ITransactionManager
  ) {}

  async execute({ deleteStoryInput, storyDeleted }: IDeleteStoryUseCaseOptions): Promise<void> {
    const deletedStory = await this.transactionManager.execute(async () => {
      const { storyIdToDelete } = deleteStoryInput

      // Story to delete is not null because we already checked for it in the validation
      const storyToDelete = await this.storyRepository.findById(new PostId(storyIdToDelete))

      // storyRepository will delete the story and the image if it exists
      await this.storyRepository.delete(storyToDelete!.id)

      storyToDelete!.delete()
      // returning the story here will trigger transaction manager to commit the transaction
      return storyToDelete!
    }, [this.storyRepository, this.imageRepository])
    storyDeleted(this.storyMapper.toDTO(deletedStory))
  }
}
