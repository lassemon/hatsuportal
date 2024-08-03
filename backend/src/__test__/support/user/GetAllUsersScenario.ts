import { UserScenarioBase } from './UserScenarioBase'
import { GetAllUsersUseCase } from '../../../application/useCases/user/GetAllUsersUseCase/GetAllUsersUseCase'
import { vi } from 'vitest'
import * as Fixture from '../../testFactory'
import { UserRoleEnum } from '@hatsuportal/common'

export class GetAllUsersScenario extends UserScenarioBase<string, 'allUsers'> {
  static given() {
    return new GetAllUsersScenario()
  }

  private constructor() {
    super(['allUsers'])
  }

  withAdminUser(admin = Fixture.userMock({ roles: [UserRoleEnum.Admin] })) {
    this.userRepository.findById = vi.fn().mockResolvedValue(admin)
    this.userRepository.getAll = vi.fn().mockResolvedValue([Fixture.userMock()])
    return this
  }

  withNonAdminUser(user = Fixture.userMock({ roles: [UserRoleEnum.Viewer] })) {
    this.userRepository.findById = vi.fn().mockResolvedValue(user)
    return this
  }

  withoutLoggedInUser() {
    this.userRepository.findById = vi.fn().mockResolvedValue(null)
    return this
  }

  async whenExecutedWithInput(loggedInUserId: string) {
    const useCase = new GetAllUsersUseCase(this.userRepository, this.userMapper)

    await this.capture(() =>
      useCase.execute({
        loggedInUserId,
        allUsers: this.spyOutputBoundary('allUsers')
      })
    )

    return this
  }
}
