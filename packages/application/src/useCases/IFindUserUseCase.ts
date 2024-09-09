import { User, UserDTO } from '@hatsuportal/domain'
import { IUseCase, IUseCaseOptions } from './IUseCase'

export interface IFindUserUseCaseOptions extends IUseCaseOptions {
  user: User
}

export type IFindUserUseCase = IUseCase<IFindUserUseCaseOptions, UserDTO>
