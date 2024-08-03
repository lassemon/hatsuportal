import { ConcurrencyError, IUseCase, IUseCaseOptions } from '@hatsuportal/common-bounded-context'
import { UserDTO } from '../dtos/UserDTO'
import { UpdateUserInputDTO } from '../dtos/UpdateUserInputDTO'
import { User } from '../../domain'

export interface IUpdateUserUseCaseOptions extends IUseCaseOptions {
  updateUserInput: UpdateUserInputDTO
  userUpdated: (updatedUser: UserDTO) => void
  updateConflict: (error: ConcurrencyError<User>) => void
}

export type IUpdateUserUseCase = IUseCase<IUpdateUserUseCaseOptions>
