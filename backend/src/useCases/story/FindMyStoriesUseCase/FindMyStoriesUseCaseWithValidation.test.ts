import { describe, it, vi, afterEach } from 'vitest'
import { AuthorizationError } from '@hatsuportal/common-bounded-context'
import { FindMyStoriesValidationScenario } from '../../../__test__/support/story/FindMyStoriesValidationScenario'

describe('FindMyStoriesUseCaseWithValidation', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should execute underlying use case when validation passes', async ({ unitFixture }) => {
    const scenario = await FindMyStoriesValidationScenario.given().withLoggedInUser().whenExecutedWithInput({
      loggedInUserId: unitFixture.userDTOMock().id,
      storyIdToFind: '123'
    })

    scenario.thenUnderlyingUseCaseExecuted(scenario.useCaseMock)
  })

  it('should throw AuthorizationError when user not found', async ({ unitFixture }) => {
    const scenario = await FindMyStoriesValidationScenario.given()
      .withoutLoggedInUser()
      .expectErrorOfType(AuthorizationError)
      .whenExecutedWithInput({
        loggedInUserId: unitFixture.userDTOMock().id,
        storyIdToFind: '123'
      })

    scenario.thenUnderlyingUseCaseNotExecuted(scenario.useCaseMock)
  })
})
