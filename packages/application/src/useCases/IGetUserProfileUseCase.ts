import { User } from '@hatsuportal/domain'
import { IUseCase, IUseCaseOptions } from './IUseCase'
import { ProfileDTO } from '../dtos/ProfileDTO'

export interface IGetUserProfileUseCaseOptions extends IUseCaseOptions {
  user: User
  userProfile: (profile: ProfileDTO) => void
}

export type IGetUserProfileUseCase = IUseCase<IGetUserProfileUseCaseOptions>
