import { UserScenarioBase } from './UserScenarioBase'
import { UpdateUserUseCase } from '../../../application/useCases/user/UpdateUserUseCase/UpdateUserUseCase'
import { vi } from 'vitest'
import * as Fixture from '../../testFactory'
import { UserRoleEnum } from '@hatsuportal/common'
import { IUserService, UpdateUserInputDTO } from '@hatsuportal/user-management'

export class UpdateUserScenario extends UserScenarioBase<UpdateUserInputDTO, 'userUpdated' | 'updateConflict'> {
  static given() {
    return new UpdateUserScenario()
  }

  private constructor() {
    super(['userUpdated', 'updateConflict'])
  }

  private readonly userServiceMock: IUserService = {
    validatePasswordChange: vi.fn().mockResolvedValue(undefined)
  }

  withAdminAndExistingUser(admin = Fixture.userMock({ roles: [UserRoleEnum.Admin] }), existing = Fixture.userMock()) {
    // first findById call -> loggedIn admin, second -> existing user
    this.userRepository.findById = vi.fn().mockResolvedValueOnce(admin).mockResolvedValueOnce(existing)
    this.userRepository.update = vi.fn().mockResolvedValue(existing)
    return this
  }

  withNonAdminUser(user = Fixture.userMock({ roles: [UserRoleEnum.Viewer] }), target = Fixture.userMock()) {
    this.userRepository.findById = vi.fn().mockResolvedValueOnce(user).mockResolvedValueOnce(target)
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
    const useCase = new UpdateUserUseCase(this.userRepository, this.userMapper, this.userServiceMock)

    await this.capture(() =>
      useCase.execute({
        updateUserInput: input,
        userUpdated: this.spyOutputBoundary('userUpdated'),
        updateConflict: this.spyOutputBoundary('updateConflict')
      })
    )

    return this
  }
}
