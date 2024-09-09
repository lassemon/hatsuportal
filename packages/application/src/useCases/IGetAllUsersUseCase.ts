import { User, UserDTO } from '@hatsuportal/domain'
import { IUseCase, IUseCaseOptions } from './IUseCase'

export interface IGetAllUsersUseCaseOptions extends IUseCaseOptions {
  user: User
}

export type IGetAllUsersUseCase = IUseCase<IGetAllUsersUseCaseOptions, UserDTO[]>
