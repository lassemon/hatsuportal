import { vi } from 'vitest'
import { UpdateUserUseCaseWithValidation } from '../../../application/useCases/user/UpdateUserUseCase/UpdateUserUseCaseWithValidation'
import { UserValidationScenarioBase } from './UserValidationScenarioBase'
import * as Fixture from '../../testFactory'
import { UserRoleEnum } from '@hatsuportal/common'
import { IUpdateUserUseCase, IUpdateUserUseCaseOptions } from '../../../application'
import { UserId, UserRole } from '../../../domain'

export class UpdateUserValidationScenario extends UserValidationScenarioBase<IUpdateUserUseCaseOptions, 'userUpdated' | 'updateConflict'> {
  static given() {
    return new UpdateUserValidationScenario()
  }

  private constructor() {
    super(['userUpdated', 'updateConflict'])
  }

  private readonly innerUseCaseMock: IUpdateUserUseCase = {
    execute: vi.fn().mockResolvedValue(undefined)
  }

  withAdminAndExistingUser(admin = Fixture.userMock({ roles: [new UserRole(UserRoleEnum.Admin)] }), existing = Fixture.userMock()) {
    this.userRepository.findById = vi
      .fn()
      .mockResolvedValueOnce(admin) // first call logged in
      .mockResolvedValueOnce(existing) // second call user to update
    return this
  }

  withoutTargetUser(admin = Fixture.userMock({ roles: [new UserRole(UserRoleEnum.Admin)] })) {
    this.userRepository.findById = vi.fn().mockResolvedValueOnce(admin).mockResolvedValueOnce(null)
    return this
  }

  withNonAdminUserWhoIsNotTheTargetUser(
    user = Fixture.userMock({ roles: [new UserRole(UserRoleEnum.Viewer)] }),
    target = Fixture.userMock({ id: new UserId(user.id.value + '1') })
  ) {
    this.userRepository.findById = vi.fn().mockResolvedValueOnce(user).mockResolvedValueOnce(target)
    return this
  }

  async whenExecutedWithInput(input: IUpdateUserUseCaseOptions) {
    const wrapped = new UpdateUserUseCaseWithValidation(
      this.innerUseCaseMock,
      this.userRepository,
      this.userMapper,
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
