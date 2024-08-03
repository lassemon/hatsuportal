import { IStoryRepository, PostCreatorId } from '@hatsuportal/post-management'
import { IGetUserProfileUseCase, IGetUserProfileUseCaseOptions } from '@hatsuportal/user-management'

export class GetUserProfileUseCase implements IGetUserProfileUseCase {
  constructor(private readonly storyRepository: IStoryRepository) {}

  async execute({ user, userProfile }: IGetUserProfileUseCaseOptions) {
    const storiesCreated = await this.storyRepository.countStoriesByCreator(new PostCreatorId(user.id.toString()))

    userProfile({ storiesCreated })
  }
}
