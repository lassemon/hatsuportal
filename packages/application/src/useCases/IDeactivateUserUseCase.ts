import { User } from '@hatsuportal/domain'
import { IUseCase, IUseCaseOptions } from './IUseCase'

export interface IDeactivateUserUseCaseOptions extends IUseCaseOptions {
  user: User
  userId: string
}

export type IDeactivateUserUseCase = IUseCase<IDeactivateUserUseCaseOptions, void>
