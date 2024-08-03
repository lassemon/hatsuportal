import { IUseCase, IUseCaseOptions } from './IUseCase'
import { DeactivateUserInputDTO } from '../dtos/DeactivateUserInputDTO'

export interface IDeactivateUserUseCaseOptions extends IUseCaseOptions {
  deactivateUserInput: DeactivateUserInputDTO
}

export type IDeactivateUserUseCase = IUseCase<IDeactivateUserUseCaseOptions>
