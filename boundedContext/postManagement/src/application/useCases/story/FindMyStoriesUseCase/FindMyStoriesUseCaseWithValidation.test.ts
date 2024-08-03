import { describe, it, vi, afterEach } from 'vitest'
import { FindMyStoriesValidationScenario } from '../../../../__test__/support/story/FindMyStoriesValidationScenario'
import { AuthorizationError } from '@hatsuportal/platform'

describe('FindMyStoriesUseCaseWithValidation', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should execute underlying use case when validation passes', async ({ unitFixture }) => {
    const scenario = await FindMyStoriesValidationScenario.given().withLoggedInUser().whenExecutedWithInput({
      loggedInUserId: unitFixture.sampleUserId,
      storiesFound: vi.fn()
    })

    scenario.thenUnderlyingUseCaseExecuted(scenario.useCaseMock)
  })

  it('should throw AuthorizationError when logged in user does not exist', async ({ unitFixture }) => {
    const scenario = await FindMyStoriesValidationScenario.given()
      .withoutLoggedInUser()
      .expectErrorOfType(AuthorizationError)
      .whenExecutedWithInput({
        loggedInUserId: unitFixture.sampleUserId,
        storiesFound: vi.fn()
      })

    scenario.thenUnderlyingUseCaseNotExecuted(scenario.useCaseMock)
  })
})
