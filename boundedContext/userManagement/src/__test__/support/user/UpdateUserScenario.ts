import { UserScenarioBase } from './UserScenarioBase'
import { IUpdateUserUseCaseOptions, UpdateUserUseCase } from '../../../application/useCases/user/UpdateUserUseCase/UpdateUserUseCase'
import { vi } from 'vitest'
import * as Fixture from '../../testFactory'
import { UserRoleEnum } from '@hatsuportal/common'
import { IUserAuthenticationService } from '../../../application'
import { UserRole } from '../../../domain'

export class UpdateUserScenario extends UserScenarioBase<IUpdateUserUseCaseOptions, 'userUpdated' | 'updateConflict'> {
  static given() {
    return new UpdateUserScenario()
  }

  private constructor() {
    super(['userUpdated', 'updateConflict'])
  }

  private readonly userAuthenticationServiceMock: IUserAuthenticationService = {
    validatePasswordChange: vi.fn().mockResolvedValue(undefined)
  }

  authenticationWillReject(error: Error) {
    this.userAuthenticationServiceMock.validatePasswordChange = vi.fn().mockRejectedValue(error)
    return this
  }

  override withNonAdminUser(user = Fixture.userMock({ roles: [new UserRole(UserRoleEnum.Viewer)] }), target = Fixture.userMock()) {
    super.withNonAdminUser(user)
    this.mockFindById({ [target.id.value]: target, [user.id.value]: user }, user)
    return this
  }

  async whenExecutedWithInput(input: IUpdateUserUseCaseOptions) {
    const useCase = new UpdateUserUseCase(
      this.userWriteRepository,
      this.userLookupService,
      this.userApplicationMapper,
      this.userAuthenticationServiceMock,
      this.passwordFactory,
      this.unitOfWork
    )

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
