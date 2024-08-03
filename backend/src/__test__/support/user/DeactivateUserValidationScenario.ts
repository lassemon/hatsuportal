import { IDeactivateUserUseCase, DeactivateUserInputDTO } from '@hatsuportal/user-management'
import { vi } from 'vitest'
import { DeactivateUserUseCaseWithValidation } from '../../../application/useCases/user/DeactivateUserUseCase/DeactivateUserUseCaseWithValidation'
import { UserValidationScenarioBase } from './UserValidationScenarioBase'

export class DeactivateUserValidationScenario extends UserValidationScenarioBase<DeactivateUserInputDTO, 'userDeactivated'> {
  static given() {
    return new DeactivateUserValidationScenario()
  }

  private constructor() {
    super(['userDeactivated'])
  }

  private readonly innerUseCaseMock: IDeactivateUserUseCase = {
    execute: vi.fn().mockResolvedValue(undefined)
  }

  async whenExecutedWithInput(input: DeactivateUserInputDTO) {
    const wrapped = new DeactivateUserUseCaseWithValidation(this.innerUseCaseMock, this.userRepository, this.authorizationService)

    await this.capture(() =>
      wrapped.execute({
        deactivateUserInput: input,
        userDeactivated: this.spyOutputBoundary('userDeactivated')
      })
    )

    return this
  }

  get useCaseMock() {
    return this.innerUseCaseMock
  }
}
