import { IUseCase, IUseCaseOptions } from '@hatsuportal/common-bounded-context'
import { ProfileDTO } from '../dtos'
import { User } from '../../domain'

export interface IGetUserProfileUseCaseOptions extends IUseCaseOptions {
  user: User
  userProfile: (profile: ProfileDTO) => void
}

export type IGetUserProfileUseCase = IUseCase<IGetUserProfileUseCaseOptions>
