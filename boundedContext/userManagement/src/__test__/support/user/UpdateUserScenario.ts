import { UserScenarioBase } from './UserScenarioBase'
import { IUpdateUserUseCaseOptions, UpdateUserUseCase } from '../../../application/useCases/user/UpdateUserUseCase/UpdateUserUseCase'
import { vi } from 'vitest'
import * as Fixture from '../../testFactory'
import { UserRoleEnum } from '@hatsuportal/common'
import { IUserService } from '../../../application'
import { UserRole } from '../../../domain'

export class UpdateUserScenario extends UserScenarioBase<IUpdateUserUseCaseOptions, 'userUpdated' | 'updateConflict'> {
  static given() {
    return new UpdateUserScenario()
  }

  private constructor() {
    super(['userUpdated', 'updateConflict'])
  }

  private readonly userServiceMock: IUserService = {
    validatePasswordChange: vi.fn().mockResolvedValue(undefined)
  }

  withAdminAndExistingUser(admin = Fixture.userMock({ roles: [new UserRole(UserRoleEnum.Admin)] }), existing = Fixture.userMock()) {
    // first findById call -> loggedIn admin, second -> existing user
    this.userRepository.findById = vi.fn().mockResolvedValueOnce(admin).mockResolvedValueOnce(existing)
    this.userRepository.update = vi.fn().mockResolvedValue(existing)
    return this
  }

  override withNonAdminUser(user = Fixture.userMock({ roles: [new UserRole(UserRoleEnum.Viewer)] }), target = Fixture.userMock()) {
    super.withNonAdminUser(user)
    this.userRepository.findById = vi.fn().mockResolvedValueOnce(user).mockResolvedValueOnce(target)
    return this
  }

  withoutTargetUser(admin = Fixture.userMock({ roles: [new UserRole(UserRoleEnum.Admin)] })) {
    this.userRepository.findById = vi.fn().mockResolvedValueOnce(admin).mockResolvedValueOnce(null)
    return this
  }

  async whenExecutedWithInput(input: IUpdateUserUseCaseOptions) {
    const useCase = new UpdateUserUseCase(this.userRepository, this.userMapper, this.userServiceMock, this.passwordFactory)

    await this.capture(() =>
      useCase.execute({
        updatedById: input.updatedById,
        updateUserInput: input.updateUserInput,
        userUpdated: this.spyOutputBoundary('userUpdated'),
        updateConflict: this.spyOutputBoundary('updateConflict')
      })
    )

    return this
  }
}
