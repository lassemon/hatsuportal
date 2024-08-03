import { IUseCase, IUseCaseOptions } from '@hatsuportal/common-bounded-context'
import { DeactivateUserInputDTO, UserDTO } from '../dtos'

export interface IDeactivateUserUseCaseOptions extends IUseCaseOptions {
  deactivateUserInput: DeactivateUserInputDTO
  userDeactivated: (user: UserDTO) => void
}

export type IDeactivateUserUseCase = IUseCase<IDeactivateUserUseCaseOptions>
