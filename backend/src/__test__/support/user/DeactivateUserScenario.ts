import { UserScenarioBase } from './UserScenarioBase'
import { DeactivateUserUseCase } from '../../../application/useCases/user/DeactivateUserUseCase/DeactivateUserUseCase'
import { DeactivateUserInputDTO } from '@hatsuportal/user-management'

export class DeactivateUserScenario extends UserScenarioBase<DeactivateUserInputDTO, 'userDeactivated'> {
  static given() {
    return new DeactivateUserScenario()
  }

  private constructor() {
    super(['userDeactivated'])
  }

  async whenExecutedWithInput(input: DeactivateUserInputDTO) {
    const useCase = new DeactivateUserUseCase(this.userRepository, this.userMapper, this.transactionBundle.transactionManagerMock)

    await this.capture(() =>
      useCase.execute({
        deactivateUserInput: input,
        userDeactivated: this.spyOutputBoundary('userDeactivated')
      })
    )

    return this
  }
}
