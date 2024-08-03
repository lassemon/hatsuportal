import { IUseCase, IUseCaseOptions } from '@hatsuportal/common-bounded-context'
import { DeactivateUserInputDTO } from '../dtos/DeactivateUserInputDTO'
import { UserDTO } from '../dtos/UserDTO'

export interface IDeactivateUserUseCaseOptions extends IUseCaseOptions {
  deactivateUserInput: DeactivateUserInputDTO
  userDeactivated: (user: UserDTO) => void
}

export type IDeactivateUserUseCase = IUseCase<IDeactivateUserUseCaseOptions>
