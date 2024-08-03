import { IUseCase, IUseCaseOptions } from './IUseCase'
import { UserDTO } from '../dtos/UserDTO'

export interface IGetAllUsersUseCaseOptions extends IUseCaseOptions {
  loggedInUserId: string
  allUsers: (users: UserDTO[]) => void
}

export type IGetAllUsersUseCase = IUseCase<IGetAllUsersUseCaseOptions>
