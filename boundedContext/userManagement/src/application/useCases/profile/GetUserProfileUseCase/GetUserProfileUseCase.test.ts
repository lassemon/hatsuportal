import { afterEach, describe, expect, it, vi } from 'vitest'
import { GetUserProfileScenario } from '../../../../__test__/support/profile/GetUserProfileScenario'

describe('GetUserProfileUseCase', () => {
  afterEach(() => vi.restoreAllMocks())

  it('should return profile with storiesCreated count', async ({ unitFixture }) => {
    const user = unitFixture.userMock()
    const scenario = await GetUserProfileScenario.given().whenExecutedWithInput(user)

    scenario.thenOutputBoundaryCalled('userProfile', { storiesCreated: expect.any(Number) })
  })

  it('should not call output boundary when repository fails', async ({ unitFixture }) => {
    // TODO: Implement this test
    /*const user = unitFixture.userMock()
    const scenario = await GetUserProfileScenario.given()
      .repositoryWillReject(new unitFixture.TestError('db fail'))
      .expectErrorOfType(unitFixture.TestError)
      .whenExecutedWithInput(user)

    scenario.thenOutputBoundaryNotCalled('userProfile')*/
  })
})
