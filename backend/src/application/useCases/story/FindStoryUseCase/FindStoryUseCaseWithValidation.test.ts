import { describe, it, vi, afterEach } from 'vitest'
import { AuthorizationError, InvalidInputError, NotFoundError } from '@hatsuportal/common-bounded-context'
import { FindStoryValidationScenario } from '../../../../__test__/support/story/FindStoryValidationScenario'

describe('FindStoryUseCaseWithValidation', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should execute underlying use case when validations pass', async ({ unitFixture }) => {
    const scenario = await FindStoryValidationScenario.given().withLoggedInUser().withExistingStory().whenExecutedWithInput({
      loggedInUserId: unitFixture.userDTOMock().id,
      storyIdToFind: unitFixture.storyDTOMock().id
    })

    scenario.thenUnderlyingUseCaseExecuted(scenario.useCaseMock)
  })

  it('should throw NotFoundError when story is not found', async ({ unitFixture }) => {
    const scenario = await FindStoryValidationScenario.given()
      .withLoggedInUser()
      .withoutExistingStory()
      .expectErrorOfType(NotFoundError)
      .whenExecutedWithInput({
        loggedInUserId: unitFixture.userDTOMock().id,
        storyIdToFind: 'non-existent-story-a2f0-f95ccab82d92'
      })

    scenario.thenUnderlyingUseCaseNotExecuted(scenario.useCaseMock)
  })

  it('should throw NotFoundError when authorization fails', async ({ unitFixture }) => {
    const scenario = await FindStoryValidationScenario.given()
      .withLoggedInUser()
      .withExistingStory()
      .authorizationWillFail('denied')
      .expectErrorOfType(AuthorizationError)
      .whenExecutedWithInput({
        loggedInUserId: unitFixture.userDTOMock().id,
        storyIdToFind: unitFixture.storyDTOMock().id
      })

    scenario.thenUnderlyingUseCaseNotExecuted(scenario.useCaseMock)
  })

  it('should throw InvalidInputError when storyIdToFind is invalid', async ({ unitFixture }) => {
    const scenario = await FindStoryValidationScenario.given()
      .withLoggedInUser()
      .withExistingStory()
      .expectErrorOfType(InvalidInputError)
      .whenExecutedWithInput({
        loggedInUserId: unitFixture.userDTOMock().id,
        storyIdToFind: 'invalid-id-a2f0-f95ccab82d92'
      })

    scenario.thenUnderlyingUseCaseNotExecuted(scenario.useCaseMock)
  })
})
