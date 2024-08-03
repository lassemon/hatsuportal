import { ICreateStoryUseCase, ICreateStoryUseCaseOptions, IStoryApplicationMapper, IStoryRepository } from '@hatsuportal/post-management'
import { UserId, IUserRepository } from '@hatsuportal/user-management'
import { IImageRepository } from '@hatsuportal/common-bounded-context'
import { ITransactionManager } from '@hatsuportal/common-bounded-context'

export class CreateStoryUseCase implements ICreateStoryUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly imageRepository: IImageRepository,
    private readonly storyRepository: IStoryRepository,
    private readonly storyMapper: IStoryApplicationMapper,
    private readonly transactionManager: ITransactionManager
  ) {}
  async execute({ createStoryInput, storyCreated }: ICreateStoryUseCaseOptions) {
    const { loggedInUserId } = createStoryInput
    const loggedInUser = await this.userRepository.findById(new UserId(loggedInUserId))

    const savedStory = await this.transactionManager.execute(async () => {
      // Logged in user is not null because we already checked for it in the validation
      const story = this.storyMapper.createInputToDomainEntity(createStoryInput, loggedInUser!.id.value, loggedInUser!.name.value)

      // storyRepository will insert the story and the image if it exists
      const savedStory = await this.storyRepository.insert(story)

      // returning the story here will trigger transaction manager to commit the transaction
      return savedStory
    }, [this.storyRepository, this.imageRepository])

    storyCreated(this.storyMapper.toDTO(savedStory))
  }
}
