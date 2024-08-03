import { UserScenarioBase } from './UserScenarioBase'
import { FindUserUseCase, IFindUserUseCaseOptions } from '../../../application/useCases/user/FindUserUseCase/FindUserUseCase'
import { vi } from 'vitest'
import * as Fixture from '../../testFactory'
import { UserRoleEnum } from '@hatsuportal/foundation'
import { UserRole } from '../../../domain'

export class FindUserScenario extends UserScenarioBase<IFindUserUseCaseOptions, 'userFound'> {
  static given() {
    return new FindUserScenario()
  }

  private constructor() {
    super(['userFound'])
  }

  withAdminAndTargetUser(admin = Fixture.userMock({ roles: [new UserRole(UserRoleEnum.Admin)] }), target = Fixture.userMock()) {
    this.userRepository.findById = vi
      .fn()
      .mockResolvedValueOnce(admin) // first call -> logged in user
      .mockResolvedValueOnce(target) // second call -> user to find
    return this
  }

  withoutTargetUser(admin = Fixture.userMock({ roles: [new UserRole(UserRoleEnum.Admin)] })) {
    this.userRepository.findById = vi.fn().mockResolvedValueOnce(admin).mockResolvedValueOnce(null)
    return this
  }

  async whenExecutedWithInput(input: IFindUserUseCaseOptions) {
    const useCase = new FindUserUseCase(this.userRepository, this.userMapper)

    await this.capture(() =>
      useCase.execute({
        loggedInUserId: input.loggedInUserId,
        findUserInput: input.findUserInput,
        userFound: this.spyOutputBoundary('userFound')
      })
    )

    return this
  }
}
