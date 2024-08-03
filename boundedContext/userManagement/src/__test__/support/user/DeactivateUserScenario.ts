import { UserScenarioBase } from './UserScenarioBase'
import {
  DeactivateUserUseCase,
  IDeactivateUserUseCaseOptions
} from '../../../application/useCases/user/DeactivateUserUseCase/DeactivateUserUseCase'

export class DeactivateUserScenario extends UserScenarioBase<IDeactivateUserUseCaseOptions, 'userDeactivated'> {
  static given() {
    return new DeactivateUserScenario()
  }

  private constructor() {
    super(['userDeactivated'])
  }

  async whenExecutedWithInput(input: IDeactivateUserUseCaseOptions) {
    const useCase = new DeactivateUserUseCase(this.userRepository, this.userMapper, this.transactionManager)

    await this.capture(() =>
      useCase.execute({
        deactivateUserInput: input.deactivateUserInput,
        deactivatingUserId: input.deactivatingUserId,
        userDeactivated: this.spyOutputBoundary('userDeactivated')
      })
    )

    return this
  }
}
