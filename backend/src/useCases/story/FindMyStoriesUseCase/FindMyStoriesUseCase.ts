import { AuthorizationError, ApplicationError } from '@hatsuportal/common-bounded-context'
import {
  IFindMyStoriesUseCase,
  IFindMyStoriesUseCaseOptions,
  IStoryApplicationMapper,
  IStoryRepository,
  PostCreatorId
} from '@hatsuportal/post-management'
import { IUserRepository, UserId } from '@hatsuportal/user-management'

export class FindMyStoriesUseCase implements IFindMyStoriesUseCase {
  constructor(
    private readonly storyRepository: IStoryRepository,
    private readonly userRepository: IUserRepository,
    private readonly storyApplicationMapper: IStoryApplicationMapper
  ) {}

  async execute({ loggedInUserId, storiesFound }: IFindMyStoriesUseCaseOptions): Promise<void> {
    try {
      const loggedInUser = await this.userRepository.findById(new UserId(loggedInUserId))
      if (!loggedInUser) throw new AuthorizationError('You are not authorized to see these stories.')

      storiesFound(
        (await this.storyRepository.findAllForCreator(new PostCreatorId(loggedInUser.id.toString()))).map((story) =>
          this.storyApplicationMapper.toDTO(story)
        )
      )
    } catch (error) {
      if (!(error instanceof Error)) {
        throw new ApplicationError({ message: 'Unknown error', cause: error })
      }
      throw error
    }
  }
}
