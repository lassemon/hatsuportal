import { UserScenarioBase } from './UserScenarioBase'
import { FindUserUseCase } from '../../../application/useCases/user/FindUserUseCase/FindUserUseCase'
import { vi } from 'vitest'
import * as Fixture from '../../testFactory'
import { FindUserInputDTO } from '@hatsuportal/user-management'
import { UserRoleEnum } from '@hatsuportal/common'

export class FindUserScenario extends UserScenarioBase<FindUserInputDTO, 'userFound'> {
  static given() {
    return new FindUserScenario()
  }

  private constructor() {
    super(['userFound'])
  }

  withAdminAndTargetUser(admin = Fixture.userMock({ roles: [UserRoleEnum.Admin] }), target = Fixture.userMock()) {
    this.userRepository.findById = vi
      .fn()
      .mockResolvedValueOnce(admin) // first call -> logged in user
      .mockResolvedValueOnce(target) // second call -> user to find
    return this
  }

  withoutTargetUser(admin = Fixture.userMock({ roles: [UserRoleEnum.Admin] })) {
    this.userRepository.findById = vi.fn().mockResolvedValueOnce(admin).mockResolvedValueOnce(null)
    return this
  }

  async whenExecutedWithInput(input: FindUserInputDTO) {
    const useCase = new FindUserUseCase(this.userRepository, this.userMapper)

    await this.capture(() =>
      useCase.execute({
        findUserInput: input,
        userFound: this.spyOutputBoundary('userFound')
      })
    )

    return this
  }
}
