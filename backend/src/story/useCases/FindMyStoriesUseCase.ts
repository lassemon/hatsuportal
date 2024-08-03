import {
  ApplicationError,
  AuthorizationError,
  IFindMyStoriesUseCase,
  IFindMyStoriesUseCaseOptions,
  IStoryApplicationMapper
} from '@hatsuportal/application'
import { UserId, IStoryRepository, IUserRepository } from '@hatsuportal/domain'

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

      storiesFound((await this.storyRepository.findAllForUser(loggedInUser.id)).map((story) => this.storyApplicationMapper.toDTO(story)))
    } catch (error) {
      if (!(error instanceof ApplicationError)) {
        if (error instanceof Error) throw new ApplicationError(error.stack || error.message)
        throw new ApplicationError(String(error))
      }
      throw error
    }
  }
}
