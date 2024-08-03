import { afterEach, describe, it, vi } from 'vitest'
import { GetUserProfileScenario } from '../../../../__test__/support/profile/GetUserProfileScenario'

describe('GetUserProfileUseCase', () => {
  afterEach(() => vi.restoreAllMocks())

  it('should return profile with userId', async ({ unitFixture }) => {
    const user = unitFixture.userMock()
    const scenario = await GetUserProfileScenario.given().whenExecutedWithInput(user)

    scenario.thenOutputBoundaryCalled('userProfile', {
      bio: '',
      statusMessage: '',
      profileImageId: null
    })
  })
})
