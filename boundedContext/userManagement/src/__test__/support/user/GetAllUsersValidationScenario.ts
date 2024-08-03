import { vi } from 'vitest'
import { UserValidationScenarioBase } from './UserValidationScenarioBase'
import { GetAllUsersUseCaseWithValidation } from '../../../application/useCases/user/GetAllUsersUseCase/GetAllUsersUseCaseWithValidation'
import { IGetAllUsersUseCase } from '../../../application'

export class GetAllUsersValidationScenario extends UserValidationScenarioBase<string, 'allUsers'> {
  static given() {
    return new GetAllUsersValidationScenario()
  }

  private constructor() {
    super(['allUsers'])
  }

  private readonly innerUseCaseMock: IGetAllUsersUseCase = {
    execute: vi.fn().mockResolvedValue(undefined)
  }

  async whenExecutedWithInput(loggedInUserId: string) {
    const wrapped = new GetAllUsersUseCaseWithValidation(
      this.innerUseCaseMock,
      this.userRepository,
      this.userMapper,
      this.authorizationService
    )

    await this.capture(() =>
      wrapped.execute({
        loggedInUserId,
        allUsers: this.spyOutputBoundary('allUsers')
      })
    )

    return this
  }

  get useCaseMock() {
    return this.innerUseCaseMock
  }
}
