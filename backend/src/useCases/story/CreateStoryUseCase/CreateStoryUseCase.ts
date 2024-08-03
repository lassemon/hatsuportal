import _ from 'lodash'
import {
  ApplicationError,
  ICreateStoryUseCase,
  ICreateStoryUseCaseOptions,
  IStoryApplicationMapper,
  AuthenticationError,
  CreateStoryImageInputDTO
} from '@hatsuportal/application'
import { UserId, Story, IUserRepository, IUnitOfWork, StoryCreatedEvent, ImageAddedToStoryEvent, User } from '@hatsuportal/domain'
import { PostTypeEnum, unixtimeNow, uuid } from '@hatsuportal/common'

export class CreateStoryUseCase implements ICreateStoryUseCase {
  constructor(
    private readonly storyUnitOfWork: IUnitOfWork<Story | null>,
    private readonly userRepository: IUserRepository,
    private readonly storyMapper: IStoryApplicationMapper
  ) {}
  async execute({ createStoryInput, storyCreated }: ICreateStoryUseCaseOptions) {
    try {
      const { loggedInUserId, createStoryData } = createStoryInput
      const loggedInUser = await this.userRepository.findById(new UserId(loggedInUserId))

      // TODO: remove isCreator and use Policy Based Access Control instead
      if (!loggedInUser || !loggedInUser.isCreator()) throw new AuthenticationError('Not authorized to create a new story.')

      const newStoryId = uuid()

      const story = new Story({
        id: newStoryId,
        visibility: createStoryData.visibility,
        image: createStoryData.image ? this.createStoryImage(createStoryData.image, newStoryId, loggedInUser) : null,
        name: createStoryData.name,
        description: createStoryData.description,
        createdBy: loggedInUser.id.value,
        createdByUserName: loggedInUser.name.value,
        createdAt: unixtimeNow(),
        updatedAt: null
      })

      story.addDomainEvent(new StoryCreatedEvent(story))
      if (story.image) story.addDomainEvent(new ImageAddedToStoryEvent(story, story.image))

      try {
        this.storyUnitOfWork.aggregate = story
        // unit of work sends all domain events and takes care of committing the transaction
        await this.storyUnitOfWork.execute()
        storyCreated(this.storyMapper.toDTO(this.storyUnitOfWork.aggregate))
      } catch (error) {
        throw error
      }
    } catch (error) {
      if (!(error instanceof ApplicationError)) {
        if (error instanceof Error) throw new ApplicationError(error.stack || error.message)
        throw new ApplicationError(String(error))
      }
      throw error
    }
  }

  private createStoryImage(newImage: CreateStoryImageInputDTO, newStoryId: string, loggedInUser: User) {
    return {
      id: uuid(),
      visibility: newImage.visibility,
      fileName: newStoryId,
      mimeType: newImage.mimeType,
      size: newImage.size,
      ownerId: newStoryId,
      ownerType: PostTypeEnum.Story,
      base64: newImage.base64,
      createdBy: loggedInUser.id.value,
      createdByUserName: loggedInUser.name.value,
      createdAt: unixtimeNow(),
      updatedAt: null
    }
  }
}
