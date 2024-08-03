import { afterEach, describe, it, vi } from 'vitest'
import { UserRoleEnum } from '@hatsuportal/common'
import { AuthorizationError, AuthenticationError } from '@hatsuportal/common-bounded-context'
import { DeactivateUserValidationScenario } from '../../../../__test__/support/user/DeactivateUserValidationScenario'

describe('DeactivateUserUseCaseWithValidation', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  const validInput = (userId: string) => ({
    loggedInUserId: userId,
    userIdToDeactivate: userId
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
      .withUserRoles(UserRoleEnum.Admin, UserRoleEnum.Creator)
      .withActualAuthorizationService()
      .whenExecutedWithInput(validInput(unitFixture.userDTOMock().id))

    scenario.thenUnderlyingUseCaseExecuted(scenario.useCaseMock)
  })

  it('should throw AuthorizationError if user does not have admin role', async ({ unitFixture }) => {
    const scenario = await DeactivateUserValidationScenario.given()
      .withoutLoggedInUser()
      .withUserRoles(UserRoleEnum.Viewer)
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
