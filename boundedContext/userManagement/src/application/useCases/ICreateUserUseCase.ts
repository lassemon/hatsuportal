import { IUseCase, IUseCaseOptions } from '@hatsuportal/common-bounded-context'
import { UserDTO } from '../dtos/UserDTO'
import { CreateUserInputDTO } from '../dtos/CreateUserInputDTO'

export interface ICreateUserUseCaseOptions extends IUseCaseOptions {
  createUserInput: CreateUserInputDTO
  foundUser: (user: UserDTO) => void
}

export type ICreateUserUseCase = IUseCase<ICreateUserUseCaseOptions>
