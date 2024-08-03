import { IFindUserUseCase, FindUserInputDTO } from '@hatsuportal/user-management'
import { vi } from 'vitest'
import { FindUserUseCaseWithValidation } from '../../../application/useCases/user/FindUserUseCase/FindUserUseCaseWithValidation'
import { UserValidationScenarioBase } from './UserValidationScenarioBase'
import { UserRoleEnum } from '@hatsuportal/common'
import * as Fixture from '../../testFactory'

export class FindUserValidationScenario extends UserValidationScenarioBase<FindUserInputDTO, 'userFound'> {
  static given() {
    return new FindUserValidationScenario()
  }

  private constructor() {
    super(['userFound'])
  }

  private readonly innerUseCaseMock: IFindUserUseCase = {
    execute: vi.fn().mockResolvedValue(undefined)
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
    const wrapped = new FindUserUseCaseWithValidation(this.innerUseCaseMock, this.userRepository, this.authorizationService)

    await this.capture(() =>
      wrapped.execute({
        findUserInput: input,
        userFound: this.spyOutputBoundary('userFound')
      })
    )

    return this
  }

  get useCaseMock() {
    return this.innerUseCaseMock
  }
}
