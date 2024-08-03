import { IUseCase, IUseCaseOptions, NotFoundError } from '@hatsuportal/platform'
import { User } from '../../../../domain'
import { ProfileDTO } from '../../../dtos'
import { IPostGateway } from '../../../acl/postManagement/IPostGateway'

export interface IGetUserProfileUseCaseOptions extends IUseCaseOptions {
  user: User
  userProfile: (profile: ProfileDTO) => void
}

export type IGetUserProfileUseCase = IUseCase<IGetUserProfileUseCaseOptions>

export class GetUserProfileUseCase implements IGetUserProfileUseCase {
  constructor(private readonly postGateway: IPostGateway) {}

  async execute({ user, userProfile }: IGetUserProfileUseCaseOptions) {
    const storiesCreated = await this.postGateway.getStoriesByCreatorId(user.id.toString())
    if (storiesCreated.isFailed()) {
      throw new NotFoundError({ message: 'Failed to get stories created', cause: storiesCreated.error })
    }

    userProfile({ storiesCreated: storiesCreated.value.length })
  }
}
