import { ApplicationError, IGetUserProfileUseCase, IGetUserProfileUseCaseOptions, IStoryRepository } from '@hatsuportal/application'

export class GetUserProfileUseCase implements IGetUserProfileUseCase {
  constructor(private readonly storyRepository: IStoryRepository) {}

  async execute({ user, userProfile }: IGetUserProfileUseCaseOptions) {
    try {
      const storiesCreated = await this.storyRepository.countStoriesCreatedByUser(user.id)

      userProfile({ storiesCreated })
    } catch (error) {
      if (!(error instanceof ApplicationError)) {
        if (error instanceof Error) throw new ApplicationError(error.stack || error.message)
        throw new ApplicationError(String(error))
      }
      throw error
    }
  }
}
