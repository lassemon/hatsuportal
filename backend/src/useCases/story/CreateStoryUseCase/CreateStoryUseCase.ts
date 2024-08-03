import _ from 'lodash'
import {
  ICreateStoryUseCase,
  ICreateStoryUseCaseOptions,
  IStoryApplicationMapper,
  CreateStoryImageInputDTO,
  Story,
  StoryCreatedEvent,
  ImageAddedToStoryEvent,
  IStoryRepository,
  CreateStoryInputDTO
} from '@hatsuportal/post-management'
import { UserId, IUserRepository, User } from '@hatsuportal/user-management'
import { EntityTypeEnum, Logger, unixtimeNow, uuid } from '@hatsuportal/common'
import { IImageRepository } from '@hatsuportal/common-bounded-context'
import { ApplicationError, IDomainEventDispatcher, ITransactionManager } from '@hatsuportal/common-bounded-context'

const logger = new Logger('CreateStoryUseCase')

export class CreateStoryUseCase implements ICreateStoryUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly imageRepository: IImageRepository,
    private readonly storyRepository: IStoryRepository,
    private readonly storyMapper: IStoryApplicationMapper,
    private readonly transactionManager: ITransactionManager,
    private readonly eventDispatcher: IDomainEventDispatcher
  ) {}
  async execute({ createStoryInput, storyCreated }: ICreateStoryUseCaseOptions) {
    try {
      const { loggedInUserId } = createStoryInput
      const loggedInUser = await this.userRepository.findById(new UserId(loggedInUserId))

      const savedStory = await this.transactionManager.execute(async () => {
        // Logged in user is not null because we already checked for it in the validation
        const story = this.createStory(createStoryInput, loggedInUser!)

        // storyRepository will insert the story and the image if it exists
        const savedStory = await this.storyRepository.insert(story)

        // returning the story here will trigger transaction manager to commit the transaction
        return savedStory
      }, [this.storyRepository, this.imageRepository])
      storyCreated(this.storyMapper.toDTO(await this.dispatchEvents(savedStory)))
    } catch (error) {
      if (!(error instanceof ApplicationError)) {
        if (error instanceof Error) throw new ApplicationError(error.stack || error.message)
        throw new ApplicationError(String(error))
      }
      throw error
    }
  }

  private createStory(createStoryInput: CreateStoryInputDTO, loggedInUser: User): Story {
    const { createStoryData } = createStoryInput
    const newStoryId = uuid()

    const now = unixtimeNow()

    const story = new Story({
      id: newStoryId,
      visibility: createStoryData.visibility,
      image: createStoryData.image ? this.createStoryImage(createStoryData.image, newStoryId, loggedInUser) : null,
      name: createStoryData.name,
      description: createStoryData.description,
      createdById: loggedInUser.id.value,
      createdByName: loggedInUser.name.value,
      createdAt: now,
      updatedAt: now
    })

    story.addDomainEvent(new StoryCreatedEvent(story))
    if (story.image) story.addDomainEvent(new ImageAddedToStoryEvent(story, story.image))

    return story
  }

  private createStoryImage(newImage: CreateStoryImageInputDTO, newStoryId: string, loggedInUser: User) {
    const now = unixtimeNow()
    return {
      id: uuid(),
      fileName: newStoryId,
      mimeType: newImage.mimeType,
      size: newImage.size,
      ownerEntityId: newStoryId,
      ownerEntityType: EntityTypeEnum.Story,
      base64: newImage.base64,
      createdById: loggedInUser.id.value,
      createdByName: loggedInUser.name.value,
      createdAt: now,
      updatedAt: now
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
