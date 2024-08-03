import { ConcurrencyError, IUseCase, IUseCaseOptions } from '@hatsuportal/common-bounded-context'
import { UpdateUserInputDTO, UserDTO } from '../dtos'
import { User } from '../../domain'

export interface IUpdateUserUseCaseOptions extends IUseCaseOptions {
  updateUserInput: UpdateUserInputDTO
  userUpdated: (updatedUser: UserDTO) => void
  updateConflict: (error: ConcurrencyError<User>) => void
}

export type IUpdateUserUseCase = IUseCase<IUpdateUserUseCaseOptions>
