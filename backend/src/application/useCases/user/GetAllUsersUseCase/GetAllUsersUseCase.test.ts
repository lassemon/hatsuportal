import { afterEach, describe, expect, it, vi } from 'vitest'
import { AuthorizationError } from '@hatsuportal/common-bounded-context'
import { GetAllUsersScenario } from '../../../../__test__/support/user/GetAllUsersScenario'

describe('GetAllUsersUseCase', () => {
  afterEach(() => vi.restoreAllMocks())

  it('should return all users for admin', async ({ unitFixture }) => {
    const scenario = await GetAllUsersScenario.given().withAdminUser().whenExecutedWithInput(unitFixture.userDTOMock().id)

    scenario.thenOutputBoundaryCalled('allUsers', expect.any(Array))
  })

  it('should throw AuthorizationError for non-admin user', async ({ unitFixture }) => {
    const scenario = await GetAllUsersScenario.given()
      .withNonAdminUser()
      .expectErrorOfType(AuthorizationError)
      .whenExecutedWithInput(unitFixture.userDTOMock().id)

    scenario.thenOutputBoundaryNotCalled('allUsers')
  })

  it('should throw AuthorizationError when user not logged in', async ({ unitFixture }) => {
    const scenario = await GetAllUsersScenario.given()
      .withoutLoggedInUser()
      .expectErrorOfType(AuthorizationError)
      .whenExecutedWithInput(unitFixture.userDTOMock().id)

    scenario.thenOutputBoundaryNotCalled('allUsers')
  })

  it('should not call output boundary when repository fails', async ({ unitFixture }) => {
    const scenario = await GetAllUsersScenario.given()
      .withAdminUser()
      .repositoryWillReject('getAll', new unitFixture.TestError('DB failure'))
      .expectErrorOfType(unitFixture.TestError)
      .whenExecutedWithInput(unitFixture.userDTOMock().id)

    scenario.thenOutputBoundaryNotCalled('allUsers')
  })
})
