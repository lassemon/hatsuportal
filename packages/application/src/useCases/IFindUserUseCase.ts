import { IUseCase, IUseCaseOptions } from './IUseCase'
import { UserDTO } from '../dtos/UserDTO'
import { FindUserInputDTO } from '../dtos/FindUserInputDTO'

export interface IFindUserUseCaseOptions extends IUseCaseOptions {
  findUserInput: FindUserInputDTO
  userFound: (user: UserDTO) => void
}

export type IFindUserUseCase = IUseCase<IFindUserUseCaseOptions>
