import { UserScenarioBase } from './UserScenarioBase'
import {
  DeactivateUserUseCase,
  IDeactivateUserUseCaseOptions
} from '../../../application/useCases/user/DeactivateUserUseCase/DeactivateUserUseCase'
import * as Fixture from '../../testFactory'
import { vi } from 'vitest'

export class DeactivateUserScenario extends UserScenarioBase<IDeactivateUserUseCaseOptions, 'userDeactivated'> {
  static given() {
    return new DeactivateUserScenario()
  }

  private constructor() {
    super(['userDeactivated'])
  }

  withInactiveTargetUser(user = Fixture.userMock({ active: false })) {
    this.userWriteRepository.findByIdForUpdate = vi.fn().mockResolvedValue(user)
    return this
  }

  withoutTargetUserForUpdate() {
    this.userWriteRepository.findByIdForUpdate = vi.fn().mockResolvedValue(null)
    return this
  }

  async whenExecutedWithInput(input: IDeactivateUserUseCaseOptions) {
    const useCase = new DeactivateUserUseCase(
      this.userWriteRepository,
      this.userLookupService,
      this.userApplicationMapper,
      this.unitOfWork
    )

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
