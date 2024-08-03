import { Logger } from '@hatsuportal/common'
import { ApplicationError, IDomainEventDispatcher, IImageRepository, ITransactionManager } from '@hatsuportal/common-bounded-context'
import {
  IDeleteStoryUseCase,
  IDeleteStoryUseCaseOptions,
  IStoryApplicationMapper,
  IStoryRepository,
  PostId,
  Story
} from '@hatsuportal/post-management'

const logger = new Logger('DeleteStoryUseCase')

export class DeleteStoryUseCase implements IDeleteStoryUseCase {
  constructor(
    private readonly imageRepository: IImageRepository,
    private readonly storyRepository: IStoryRepository,
    private readonly storyMapper: IStoryApplicationMapper,
    private readonly transactionManager: ITransactionManager,
    private readonly eventDispatcher: IDomainEventDispatcher
  ) {}

  async execute({ deleteStoryInput, storyDeleted }: IDeleteStoryUseCaseOptions): Promise<void> {
    try {
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
      storyDeleted(this.storyMapper.toDTO(await this.dispatchEvents(deletedStory)))
    } catch (error) {
      if (!(error instanceof Error)) {
        throw new ApplicationError({ message: 'Unknown error', cause: error })
      }
      throw error
    }
  }

  private async dispatchEvents(story: Story): Promise<Story> {
    for (const event of story!.domainEvents) {
      logger.debug(`Dispatching event ${event.eventType} for ${story!.id.value}`)
      await this.eventDispatcher.dispatch(event)
    }
    story!.clearEvents()

    return story
  }
}
