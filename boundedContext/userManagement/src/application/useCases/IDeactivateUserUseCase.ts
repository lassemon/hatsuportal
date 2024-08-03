import { IUseCase, IUseCaseOptions } from '@hatsuportal/common-bounded-context'
import { DeactivateUserInputDTO } from '../dtos/DeactivateUserInputDTO'

export interface IDeactivateUserUseCaseOptions extends IUseCaseOptions {
  deactivateUserInput: DeactivateUserInputDTO
}

export type IDeactivateUserUseCase = IUseCase<IDeactivateUserUseCaseOptions>
