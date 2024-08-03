import { vi } from 'vitest'
import { FindUserUseCaseWithValidation } from '../../../application/useCases/user/FindUserUseCase/FindUserUseCaseWithValidation'
import { UserValidationScenarioBase } from './UserValidationScenarioBase'
import * as Fixture from '../../testFactory'
import { UserRoleEnum } from '@hatsuportal/common'
import { IFindUserUseCase, IFindUserUseCaseOptions } from '../../../application'
import { UserId, UserRole } from '../../../domain'

export class FindUserValidationScenario extends UserValidationScenarioBase<IFindUserUseCaseOptions, 'userFound'> {
  static given() {
    return new FindUserValidationScenario()
  }

  private constructor() {
    super(['userFound'])
  }

  private readonly innerUseCaseMock: IFindUserUseCase = {
    execute: vi.fn().mockResolvedValue(undefined)
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

  withNonAdminUserWhoIsNotTheTargetUser(
    user = Fixture.userMock({ roles: [new UserRole(UserRoleEnum.Viewer)] }),
    target = Fixture.userMock({ id: new UserId(user.id.value + '1') })
  ) {
    this.userRepository.findById = vi.fn().mockResolvedValueOnce(user).mockResolvedValueOnce(target)
    return this
  }

  async whenExecutedWithInput(input: IFindUserUseCaseOptions) {
    const wrapped = new FindUserUseCaseWithValidation(
      this.innerUseCaseMock,
      this.userRepository,
      this.userMapper,
      this.authorizationService
    )

    await this.capture(() =>
      wrapped.execute({
        loggedInUserId: input.loggedInUserId,
        findUserInput: input.findUserInput,
        userFound: this.spyOutputBoundary('userFound')
      })
    )

    return this
  }

  get useCaseMock() {
    return this.innerUseCaseMock
  }
}
