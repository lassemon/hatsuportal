import { IUseCase, IUseCaseOptions } from '@hatsuportal/common-bounded-context'
import { UserDTO } from '../dtos/UserDTO'

export interface IGetAllUsersUseCaseOptions extends IUseCaseOptions {
  loggedInUserId: string
  allUsers: (users: UserDTO[]) => void
}

export type IGetAllUsersUseCase = IUseCase<IGetAllUsersUseCaseOptions>
