import { describe, it, expect, vi, afterEach } from 'vitest'
import { FindMyStoriesScenario } from '../../../../__test__/support/story/FIndMyStoriesScenario'

describe('FindMyStoriesUseCase', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should find stories for the logged in user', async ({ unitFixture }) => {
    const scenario = await FindMyStoriesScenario.given().withLoggedInUser().whenExecutedWithInput({
      loggedInUserId: unitFixture.sampleUserId,
      storiesFound: vi.fn()
    })

    scenario.thenOutputBoundaryCalled('storiesFound', expect.any(Array))
  })

  it('should not call output boundary when repository fails', async ({ unitFixture }) => {
    const scenario = await FindMyStoriesScenario.given()
      .withLoggedInUser()
      .lookupServiceWillReject('findAllForCreator', new unitFixture.TestError('DB error'))
      .expectErrorOfType(unitFixture.TestError)
      .whenExecutedWithInput({
        loggedInUserId: unitFixture.sampleUserId,
        storiesFound: vi.fn()
      })

    scenario.thenOutputBoundaryNotCalled('storiesFound')
  })
})
