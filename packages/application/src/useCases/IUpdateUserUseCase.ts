import { User, UserDTO } from '@hatsuportal/domain'
import { UpdateUserRequestDTO } from '../api/requests/UpdateUserRequestDTO'
import { IUseCase, IUseCaseOptions } from './IUseCase'

export interface IUpdateUserUseCaseOptions extends IUseCaseOptions {
  userUpdateRequest: UpdateUserRequestDTO
  user: User
}

export type IUpdateUserUseCase = IUseCase<IUpdateUserUseCaseOptions, UserDTO>
