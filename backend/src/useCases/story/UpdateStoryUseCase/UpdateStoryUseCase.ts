import {
  IUpdateStoryUseCase,
  IUpdateStoryUseCaseOptions,
  IStoryApplicationMapper,
  UpdateStoryImageInputDTO,
  PostId,
  IStoryRepository,
  Story,
  ImageUpdatedToStoryEvent,
  ImageAddedToStoryEvent,
  StoryUpdatedEvent,
  UpdateStoryInputDTO
} from '@hatsuportal/post-management'

import { Logger } from '@hatsuportal/common'
import {
  ApplicationError,
  ConcurrencyError,
  IDomainEventDispatcher,
  IImageRepository,
  ITransactionManager
} from '@hatsuportal/common-bounded-context'

const logger = new Logger('UpdateStoryUseCase')

export class UpdateStoryUseCase implements IUpdateStoryUseCase {
  constructor(
    private readonly imageRepository: IImageRepository,
    private readonly storyRepository: IStoryRepository,
    private readonly storyMapper: IStoryApplicationMapper,
    private readonly transactionManager: ITransactionManager,
    private readonly eventDispatcher: IDomainEventDispatcher
  ) {}
  async execute({ updateStoryInput, storyUpdated, updateConflict }: IUpdateStoryUseCaseOptions) {
    try {
      const savedStory = await this.transactionManager.execute(async () => {
        const existingStory = await this.storyRepository.findById(new PostId(updateStoryInput.updateStoryData.id))

        // Existing story is not null because we already checked for it in the validation
        const story = await this.updateStory(existingStory!, updateStoryInput)

        // storyRepository will update the story and the image if it exists
        const savedStory = await this.storyRepository.update(story)

        // returning the story here will trigger transaction manager to commit the transaction
        return savedStory
      }, [this.storyRepository, this.imageRepository])
      storyUpdated(this.storyMapper.toDTO(await this.dispatchEvents(savedStory)))
    } catch (error) {
      if (error instanceof ConcurrencyError) {
        updateConflict(error)
      }
      if (!(error instanceof Error)) {
        throw new ApplicationError({ message: 'Unknown error', cause: error })
      }
      throw error
    }
  }

  private async updateStory(existingStory: Story, updateStoryInput: UpdateStoryInputDTO) {
    const { updateStoryData } = updateStoryInput

    if (updateStoryData.image) {
      const oldImage = existingStory.image
      this.updateStoryImage(existingStory, updateStoryData.image)

      if (oldImage) {
        existingStory.addDomainEvent(new ImageUpdatedToStoryEvent(existingStory, oldImage, existingStory.image!))
      } else {
        existingStory.addDomainEvent(new ImageAddedToStoryEvent(existingStory, existingStory.image!))
      }
    }

    existingStory.update({
      id: updateStoryData.id,
      visibility: updateStoryData.visibility || existingStory.visibility.value,
      name: updateStoryData.name || existingStory.name.value,
      description: updateStoryData.description || existingStory.description.value,
      createdById: existingStory.createdById.value,
      createdByName: existingStory.createdByName.value,
      createdAt: existingStory.createdAt.value
    })

    existingStory.addDomainEvent(new StoryUpdatedEvent(existingStory))

    return existingStory
  }

  private updateStoryImage(existingStory: Story, newImage: UpdateStoryImageInputDTO): Story {
    existingStory.image?.update({
      fileName: existingStory.id.value,
      mimeType: newImage.mimeType,
      size: newImage.size,
      base64: newImage.base64
    })
    return existingStory
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
