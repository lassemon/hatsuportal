import { IUseCase, IUseCaseOptions } from './IUseCase'
import { UserDTO } from '../dtos/UserDTO'
import { UpdateUserInputDTO } from '../dtos/UpdateUserInputDTO'

export interface IUpdateUserUseCaseOptions extends IUseCaseOptions {
  updateUserInput: UpdateUserInputDTO
  userUpdated: (updatedUser: UserDTO) => void
}

export type IUpdateUserUseCase = IUseCase<IUpdateUserUseCaseOptions>
