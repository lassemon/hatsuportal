import { IUseCase, IUseCaseOptions } from '@hatsuportal/platform'
import { User } from '../../../../domain'
import { ProfileDTO } from '../../../dtos'

export interface IGetUserProfileUseCaseOptions extends IUseCaseOptions {
  user: User
  userProfile: (profile: ProfileDTO) => void
}

export type IGetUserProfileUseCase = IUseCase<IGetUserProfileUseCaseOptions>

export class GetUserProfileUseCase implements IGetUserProfileUseCase {
  constructor(/*private readonly storyRepository: IStoryReadRepository*/) {}

  async execute({ user, userProfile }: IGetUserProfileUseCaseOptions) {
    //const storiesCreated = await this.storyRepository.countStoriesByCreator(new PostCreatorId(user.id.toString()))

    userProfile({ storiesCreated: 0 })
  }
}
