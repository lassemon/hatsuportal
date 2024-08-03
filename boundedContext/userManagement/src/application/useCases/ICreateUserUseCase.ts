import { IUseCase, IUseCaseOptions } from '@hatsuportal/common-bounded-context'
import { CreateUserInputDTO, UserDTO } from '../dtos'

export interface ICreateUserUseCaseOptions extends IUseCaseOptions {
  createUserInput: CreateUserInputDTO
  userCreated: (user: UserDTO) => void
}

export type ICreateUserUseCase = IUseCase<ICreateUserUseCaseOptions>
