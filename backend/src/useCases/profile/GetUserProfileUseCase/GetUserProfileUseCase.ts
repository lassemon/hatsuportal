import { ApplicationError } from '@hatsuportal/common-bounded-context'
import { IStoryRepository, PostCreatorId } from '@hatsuportal/post-management'
import { IGetUserProfileUseCase, IGetUserProfileUseCaseOptions } from '@hatsuportal/user-management'

export class GetUserProfileUseCase implements IGetUserProfileUseCase {
  constructor(private readonly storyRepository: IStoryRepository) {}

  async execute({ user, userProfile }: IGetUserProfileUseCaseOptions) {
    try {
      const storiesCreated = await this.storyRepository.countStoriesByCreator(new PostCreatorId(user.id.toString()))

      userProfile({ storiesCreated })
    } catch (error) {
      if (!(error instanceof Error)) {
        throw new ApplicationError({ message: 'Unknown error', cause: error })
      }
      throw error
    }
  }
}
