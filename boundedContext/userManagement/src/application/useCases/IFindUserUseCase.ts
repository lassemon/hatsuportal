import { IUseCase, IUseCaseOptions } from '@hatsuportal/common-bounded-context'
import { FindUserInputDTO, UserDTO } from '../dtos'

export interface IFindUserUseCaseOptions extends IUseCaseOptions {
  findUserInput: FindUserInputDTO
  userFound: (user: UserDTO) => void
}

export type IFindUserUseCase = IUseCase<IFindUserUseCaseOptions>
