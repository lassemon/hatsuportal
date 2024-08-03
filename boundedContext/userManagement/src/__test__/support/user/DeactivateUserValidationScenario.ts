import { vi } from 'vitest'
import { DeactivateUserUseCaseWithValidation } from '../../../application/useCases/user/DeactivateUserUseCase/DeactivateUserUseCaseWithValidation'
import { UserValidationScenarioBase } from './UserValidationScenarioBase'
import { IDeactivateUserUseCase, IDeactivateUserUseCaseOptions } from '../../../application'

export class DeactivateUserValidationScenario extends UserValidationScenarioBase<IDeactivateUserUseCaseOptions, 'userDeactivated'> {
  static given() {
    return new DeactivateUserValidationScenario()
  }

  private constructor() {
    super(['userDeactivated'])
  }

  private readonly innerUseCaseMock: IDeactivateUserUseCase = {
    execute: vi.fn().mockResolvedValue(undefined)
  }

  async whenExecutedWithInput(input: IDeactivateUserUseCaseOptions) {
    const wrapped = new DeactivateUserUseCaseWithValidation(
      this.innerUseCaseMock,
      this.userRepository,
      this.userMapper,
      this.authorizationService
    )

    await this.capture(() =>
      wrapped.execute({
        deactivatingUserId: input.deactivatingUserId,
        deactivateUserInput: input.deactivateUserInput,
        userDeactivated: this.spyOutputBoundary('userDeactivated')
      })
    )

    return this
  }

  get useCaseMock() {
    return this.innerUseCaseMock
  }
}
