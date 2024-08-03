import { afterEach, describe, it, vi } from 'vitest'
import { GetAllUsersValidationScenario } from '../../../../__test__/support/user/GetAllUsersValidationScenario'
import { AuthenticationError, AuthorizationError } from '@hatsuportal/platform'

describe('GetAllUsersUseCaseWithValidation', () => {
  afterEach(() => vi.restoreAllMocks())

  it('should execute inner use case for admin', async ({ unitFixture }) => {
    const scenario = await GetAllUsersValidationScenario.given().withAdminUser().whenExecutedWithInput(unitFixture.userDTOMock().id)

    scenario.thenUnderlyingUseCaseExecuted(scenario.useCaseMock)
  })

  it('should throw AuthorizationError for non-admin', async ({ unitFixture }) => {
    const scenario = await GetAllUsersValidationScenario.given()
      .withNonAdminUser()
      .withActualAuthorizationService()
      .expectErrorOfType(AuthorizationError)
      .whenExecutedWithInput(unitFixture.userDTOMock().id)

    scenario.thenUnderlyingUseCaseNotExecuted(scenario.useCaseMock)
  })

  it('should throw AuthenticationError when not logged in', async ({ unitFixture }) => {
    const scenario = await GetAllUsersValidationScenario.given()
      .withoutLoggedInUser()
      .expectErrorOfType(AuthenticationError)
      .whenExecutedWithInput(unitFixture.userDTOMock().id)

    scenario.thenUnderlyingUseCaseNotExecuted(scenario.useCaseMock)
  })

  it('should throw AuthorizationError when authorization service denies', async ({ unitFixture }) => {
    const scenario = await GetAllUsersValidationScenario.given()
      .withAdminUser()
      .authorizationWillFail('denied')
      .expectErrorOfType(AuthorizationError)
      .whenExecutedWithInput(unitFixture.userDTOMock().id)

    scenario.thenUnderlyingUseCaseNotExecuted(scenario.useCaseMock)
  })
})
