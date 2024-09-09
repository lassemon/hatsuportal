import { UserDTO } from '@hatsuportal/domain'
import { IUseCase, IUseCaseOptions } from './IUseCase'
import { CreateUserRequestDTO } from '../api/requests/CreateUserRequestDTO'

export interface ICreateUserUseCaseOptions extends IUseCaseOptions {
  createUserRequest: CreateUserRequestDTO
}

export type ICreateUserUseCase = IUseCase<ICreateUserUseCaseOptions, UserDTO>
