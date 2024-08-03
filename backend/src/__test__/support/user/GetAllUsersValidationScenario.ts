import { vi } from 'vitest'
import { UserValidationScenarioBase } from './UserValidationScenarioBase'
import { GetAllUsersUseCaseWithValidation } from '../../../application/useCases/user/GetAllUsersUseCase/GetAllUsersUseCaseWithValidation'
import { IGetAllUsersUseCase } from '@hatsuportal/user-management'
import * as Fixture from '../../testFactory'
import { UserRoleEnum } from '@hatsuportal/common'

export class GetAllUsersValidationScenario extends UserValidationScenarioBase<string, 'allUsers'> {
  static given() {
    return new GetAllUsersValidationScenario()
  }

  private constructor() {
    super(['allUsers'])
  }

  private readonly innerUseCaseMock: IGetAllUsersUseCase = {
    execute: vi.fn().mockResolvedValue(undefined)
  }

  withAdminUser() {
    const admin = Fixture.userMock({ roles: [UserRoleEnum.Admin] })
    this.userRepository.findById = vi.fn().mockResolvedValue(admin)
    return this
  }

  withNonAdminUser() {
    const user = Fixture.userMock({ roles: [UserRoleEnum.Viewer] })
    this.userRepository.findById = vi.fn().mockResolvedValue(user)
    return this
  }

  withoutLoggedInUser() {
    this.userRepository.findById = vi.fn().mockResolvedValue(null)
    return this
  }

  async whenExecutedWithInput(loggedInUserId: string) {
    const wrapped = new GetAllUsersUseCaseWithValidation(this.innerUseCaseMock, this.userRepository, this.authorizationService)

    await this.capture(() =>
      wrapped.execute({
        loggedInUserId,
        allUsers: this.spyOutputBoundary('allUsers')
      })
    )

    return this
  }

  get useCaseMock() {
    return this.innerUseCaseMock
  }
}
