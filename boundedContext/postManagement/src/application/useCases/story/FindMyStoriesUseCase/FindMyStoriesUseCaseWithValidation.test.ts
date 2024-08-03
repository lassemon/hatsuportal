import { describe, it, vi, afterEach } from 'vitest'
import { FindMyStoriesValidationScenario } from '../../../../__test__/support/story/FindMyStoriesValidationScenario'
import { AuthenticationError } from '@hatsuportal/platform'

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

  it('should throw AuthenticationError when logged in user does not exist', async ({ unitFixture }) => {
    const scenario = await FindMyStoriesValidationScenario.given()
      .withoutLoggedInUser()
      .expectErrorOfType(AuthenticationError)
      .whenExecutedWithInput({
        loggedInUserId: unitFixture.sampleUserId,
        storiesFound: vi.fn()
      })

    scenario.thenUnderlyingUseCaseNotExecuted(scenario.useCaseMock)
  })
})
