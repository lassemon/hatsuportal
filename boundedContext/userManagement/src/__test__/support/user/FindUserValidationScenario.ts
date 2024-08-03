import { vi } from 'vitest'
import { FindUserUseCaseWithValidation } from '../../../application/useCases/user/FindUserUseCase/FindUserUseCaseWithValidation'
import { FindUserUseCase as RealFindUserUseCase } from '../../../application/useCases/user/FindUserUseCase/FindUserUseCase'
import { UserValidationScenarioBase } from './UserValidationScenarioBase'
import * as Fixture from '../../testFactory'
import { UserRoleEnum } from '@hatsuportal/common'
import { IFindUserUseCase, IFindUserUseCaseOptions } from '../../../application'
import { UserId, UserRole } from '../../../domain'

export class FindUserValidationScenario extends UserValidationScenarioBase<IFindUserUseCaseOptions, 'userFound'> {
  static given() {
    return new FindUserValidationScenario()
  }

  private useRealInner = false

  private constructor() {
    super(['userFound'])
  }

  private readonly innerUseCaseMock: IFindUserUseCase = {
    execute: vi.fn().mockResolvedValue(undefined)
  }

  withRealInnerUseCase() {
    this.useRealInner = true
    return this
  }

  withInactiveLoggedInUser(user = Fixture.userMock({ active: false, roles: [new UserRole(UserRoleEnum.Viewer)] })) {
    this.mockFindById({ [user.id.value]: user }, user)
    return this
  }

  withInactiveTarget(
    viewer = Fixture.userMock({ roles: [new UserRole(UserRoleEnum.Viewer)] }),
    inactiveTarget = Fixture.userMock({ active: false, id: new UserId(viewer.id.value + '1') })
  ) {
    this.mockFindById(
      {
        [viewer.id.value]: viewer,
        [inactiveTarget.id.value]: inactiveTarget
      },
      viewer
    )
    return this
  }

  async whenExecutedWithInput(input: IFindUserUseCaseOptions) {
    const innerUseCase = this.useRealInner
      ? new RealFindUserUseCase(this.userReadRepository, this.userApplicationMapper)
      : this.innerUseCaseMock

    const wrapped = new FindUserUseCaseWithValidation(innerUseCase, this.userReadRepository, this.authorizationService)

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
