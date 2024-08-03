import { afterEach, describe, expect, it, vi } from 'vitest'
import { GetAllUsersScenario } from '../../../../__test__/support/user/GetAllUsersScenario'

describe('GetAllUsersUseCase', () => {
  afterEach(() => vi.restoreAllMocks())

  it('should return all users for admin', async ({ unitFixture }) => {
    const scenario = await GetAllUsersScenario.given().withAdminUser().whenExecutedWithInput(unitFixture.userDTOMock().id)

    scenario.thenOutputBoundaryCalled('allUsers', expect.any(Array))
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
