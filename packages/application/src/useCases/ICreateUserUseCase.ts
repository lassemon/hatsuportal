import { IUseCase, IUseCaseOptions } from './IUseCase'
import { UserDTO } from '../dtos/UserDTO'
import { CreateUserInputDTO } from '../dtos/CreateUserInputDTO'

export interface ICreateUserUseCaseOptions extends IUseCaseOptions {
  createUserInput: CreateUserInputDTO
  foundUser: (user: UserDTO) => void
}

export type ICreateUserUseCase = IUseCase<ICreateUserUseCaseOptions>
