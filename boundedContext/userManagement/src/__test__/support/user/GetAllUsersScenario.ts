import { UserScenarioBase } from './UserScenarioBase'
import { GetAllUsersUseCase } from '../../../application/useCases/user/GetAllUsersUseCase/GetAllUsersUseCase'
import { vi } from 'vitest'
import * as Fixture from '../../testFactory'
import { UserRoleEnum } from '@hatsuportal/common'
import { UserRole } from '../../../domain'

export class GetAllUsersScenario extends UserScenarioBase<string, 'allUsers'> {
  static given() {
    return new GetAllUsersScenario()
  }

  private constructor() {
    super(['allUsers'])
  }

  override withAdminUser(admin = Fixture.userMock({ roles: [new UserRole(UserRoleEnum.Admin)] })) {
    super.withAdminUser(admin)
    this.userRepository.getAll = vi.fn().mockResolvedValue([Fixture.userMock()])
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
