import { afterEach, describe, it, vi } from 'vitest'
import { DeactivateUserValidationScenario } from '../../../../__test__/support/user/DeactivateUserValidationScenario'
import { AuthenticationError, AuthorizationError } from '@hatsuportal/platform'
import { UserRoleEnum } from '@hatsuportal/common'
import { UserRole } from '../../../../domain'
import { IDeactivateUserUseCaseOptions } from './DeactivateUserUseCase'

describe('DeactivateUserUseCaseWithValidation', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  const validInput = (userId: string): IDeactivateUserUseCaseOptions => ({
    deactivatingUserId: userId,
    deactivateUserInput: {
      userIdToDeactivate: userId
    },
    userDeactivated: vi.fn()
  })

  it('should successfully execute deactivate user use case when all validations pass', async ({ unitFixture }) => {
    const scenario = await DeactivateUserValidationScenario.given()
      .withAdminUser()
      .whenExecutedWithInput(validInput(unitFixture.userDTOMock().id))

    scenario.thenUnderlyingUseCaseExecuted(scenario.useCaseMock)
  })

  it('should handle user with multiple roles including admin', async ({ unitFixture }) => {
    const scenario = await DeactivateUserValidationScenario.given()
      .withoutLoggedInUser()
      .withUserRoles(new UserRole(UserRoleEnum.Admin), new UserRole(UserRoleEnum.Creator))
      .withActualAuthorizationService()
      .whenExecutedWithInput(validInput(unitFixture.userDTOMock().id))

    scenario.thenUnderlyingUseCaseExecuted(scenario.useCaseMock)
  })

  it('should throw AuthorizationError if user does not have admin role', async ({ unitFixture }) => {
    const scenario = await DeactivateUserValidationScenario.given()
      .withoutLoggedInUser()
      .withUserRoles(new UserRole(UserRoleEnum.Viewer))
      .withActualAuthorizationService()
      .expectErrorOfType(AuthorizationError)
      .whenExecutedWithInput(validInput(unitFixture.userDTOMock().id))

    scenario.thenUnderlyingUseCaseNotExecuted(scenario.useCaseMock)
  })

  it('should throw AuthenticationError if loggedInUser does not exist', async ({ unitFixture }) => {
    const scenario = await DeactivateUserValidationScenario.given()
      .withoutLoggedInUser()
      .expectErrorOfType(AuthenticationError)
      .whenExecutedWithInput(validInput(unitFixture.userDTOMock().id))

    scenario.thenUnderlyingUseCaseNotExecuted(scenario.useCaseMock)
  })

  it('should throw AuthorizationError if user not allowed to deactivate user', async ({ unitFixture }) => {
    const scenario = await DeactivateUserValidationScenario.given()
      .withAdminUser()
      .authorizationWillFail('not allowed')
      .expectErrorOfType(AuthorizationError)
      .whenExecutedWithInput(validInput(unitFixture.userDTOMock().id))

    scenario.thenUnderlyingUseCaseNotExecuted(scenario.useCaseMock)
  })
})
