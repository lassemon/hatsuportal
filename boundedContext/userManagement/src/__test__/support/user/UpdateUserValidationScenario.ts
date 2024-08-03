import { vi } from 'vitest'
import { UpdateUserUseCaseWithValidation } from '../../../application/useCases/user/UpdateUserUseCase/UpdateUserUseCaseWithValidation'
import { UpdateUserUseCase as RealUpdateUserUseCase } from '../../../application/useCases/user/UpdateUserUseCase/UpdateUserUseCase'
import { UserValidationScenarioBase } from './UserValidationScenarioBase'
import { IUserAuthenticationService, IUpdateUserUseCase, IUpdateUserUseCaseOptions } from '../../../application'

export class UpdateUserValidationScenario extends UserValidationScenarioBase<IUpdateUserUseCaseOptions, 'userUpdated' | 'updateConflict'> {
  static given() {
    return new UpdateUserValidationScenario()
  }

  private useRealInner = false

  private constructor() {
    super(['userUpdated', 'updateConflict'])
  }

  private readonly innerUseCaseMock: IUpdateUserUseCase = {
    execute: vi.fn().mockResolvedValue(undefined)
  }

  private readonly userAuthenticationServiceMock: IUserAuthenticationService = {
    validatePasswordChange: vi.fn().mockResolvedValue(undefined)
  }

  withRealInnerUseCase() {
    this.useRealInner = true
    return this
  }

  async whenExecutedWithInput(input: IUpdateUserUseCaseOptions) {
    const innerUseCase = this.useRealInner
      ? new RealUpdateUserUseCase(
          this.userWriteRepository,
          this.userLookupService,
          this.userApplicationMapper,
          this.userAuthenticationServiceMock,
          this.passwordFactory,
          this.unitOfWork
        )
      : this.innerUseCaseMock

    const wrapped = new UpdateUserUseCaseWithValidation(
      innerUseCase,
      this.userReadRepository,
      this.authorizationService,
      this.passwordFactory
    )

    await this.capture(() =>
      wrapped.execute({
        updatedById: input.updatedById,
        updateUserInput: input.updateUserInput,
        userUpdated: this.spyOutputBoundary('userUpdated'),
        updateConflict: this.spyOutputBoundary('updateConflict')
      })
    )

    return this
  }

  get useCaseMock() {
    return this.innerUseCaseMock
  }
}
