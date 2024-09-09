import { User } from '@hatsuportal/domain'
import { ProfileResponseDTO } from '../api/responses/ProfileResponseDTO'
import { IUseCase, IUseCaseOptions } from './IUseCase'

interface GetUserProfileUseCaseResponse extends ProfileResponseDTO {}

export interface IGetUserProfileUseCaseOptions extends IUseCaseOptions {
  user: User
}

export type IGetUserProfileUseCase = IUseCase<IGetUserProfileUseCaseOptions, GetUserProfileUseCaseResponse>
