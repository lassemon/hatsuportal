import { IUpdateUserUseCase, UpdateUserInputDTO } from '@hatsuportal/user-management'
import { vi } from 'vitest'
import { UpdateUserUseCaseWithValidation } from '../../../application/useCases/user/UpdateUserUseCase/UpdateUserUseCaseWithValidation'
import { UserValidationScenarioBase } from './UserValidationScenarioBase'
import * as Fixture from '../../testFactory'
import { UserRoleEnum } from '@hatsuportal/common'

export class UpdateUserValidationScenario extends UserValidationScenarioBase<UpdateUserInputDTO, 'userUpdated' | 'updateConflict'> {
  static given() {
    return new UpdateUserValidationScenario()
  }

  private constructor() {
    super(['userUpdated', 'updateConflict'])
  }

  private readonly innerUseCaseMock: IUpdateUserUseCase = {
    execute: vi.fn().mockResolvedValue(undefined)
  }

  withAdminAndExistingUser(admin = Fixture.userMock({ roles: [UserRoleEnum.Admin] }), existing = Fixture.userMock()) {
    this.userRepository.findById = vi
      .fn()
      .mockResolvedValueOnce(admin) // first call logged in
      .mockResolvedValueOnce(existing) // second call user to update
    return this
  }

  withoutLoggedInUser() {
    this.userRepository.findById = vi.fn().mockResolvedValue(null)
    return this
  }

  withoutTargetUser(admin = Fixture.userMock({ roles: [UserRoleEnum.Admin] })) {
    this.userRepository.findById = vi.fn().mockResolvedValueOnce(admin).mockResolvedValueOnce(null)
    return this
  }

  async whenExecutedWithInput(input: UpdateUserInputDTO) {
    const wrapped = new UpdateUserUseCaseWithValidation(this.innerUseCaseMock, this.userRepository, this.authorizationService)

    await this.capture(() =>
      wrapped.execute({
        updateUserInput: input,
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
