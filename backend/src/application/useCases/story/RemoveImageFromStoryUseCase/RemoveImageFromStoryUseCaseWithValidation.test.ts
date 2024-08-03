import { describe, it, vi, afterEach } from 'vitest'
import { InvalidPostIdError } from '@hatsuportal/post-management'
import { AuthorizationError, NotFoundError } from '@hatsuportal/common-bounded-context'
import { RemoveImageFromStoryValidationScenario } from '../../../../__test__/support/story/RemoveImageFromStoryValidationScenario'

describe('RemoveImageFromStoryUseCaseWithValidation', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should execute underlying use case when validations pass', async ({ unitFixture }) => {
    const scenario = await RemoveImageFromStoryValidationScenario.given().withLoggedInUser().withExistingStory().whenExecutedWithInput({
      loggedInUserId: unitFixture.userDTOMock().id,
      storyIdFromWhichToRemoveImage: unitFixture.storyDTOMock().id
    })

    scenario.thenUnderlyingUseCaseExecuted(scenario.useCaseMock)
  })

  it('should throw AuthorizationError when logged in user does not exist', async ({ unitFixture }) => {
    const scenario = await RemoveImageFromStoryValidationScenario.given()
      .withoutLoggedInUser()
      .withExistingStory()
      .expectErrorOfType(AuthorizationError)
      .whenExecutedWithInput({
        loggedInUserId: unitFixture.userDTOMock().id,
        storyIdFromWhichToRemoveImage: unitFixture.storyDTOMock().id
      })

    scenario.thenUnderlyingUseCaseNotExecuted(scenario.useCaseMock)
  })

  it('should throw NotFoundError when story does not exist', async ({ unitFixture }) => {
    const scenario = await RemoveImageFromStoryValidationScenario.given()
      .withLoggedInUser()
      .withoutExistingStory()
      .expectErrorOfType(NotFoundError)
      .whenExecutedWithInput({
        loggedInUserId: unitFixture.userDTOMock().id,
        storyIdFromWhichToRemoveImage: 'non-existent-story-id-a2f0-f95ccab82d92'
      })

    scenario.thenUnderlyingUseCaseNotExecuted(scenario.useCaseMock)
  })

  it('should throw AuthorizationError when authorization fails', async ({ unitFixture }) => {
    const scenario = await RemoveImageFromStoryValidationScenario.given()
      .withLoggedInUser()
      .withExistingStory()
      .authorizationWillFail('Forbidden')
      .expectErrorOfType(AuthorizationError)
      .whenExecutedWithInput({
        loggedInUserId: unitFixture.userDTOMock().id,
        storyIdFromWhichToRemoveImage: unitFixture.storyDTOMock().id
      })

    scenario.thenUnderlyingUseCaseNotExecuted(scenario.useCaseMock)
  })

  it('should throw InvalidPostIdError when story id is invalid', async ({ unitFixture }) => {
    const scenario = await RemoveImageFromStoryValidationScenario.given()
      .withLoggedInUser()
      .withExistingStory()
      .expectErrorOfType(InvalidPostIdError)
      .whenExecutedWithInput({
        loggedInUserId: unitFixture.userDTOMock().id,
        storyIdFromWhichToRemoveImage: 'invalid-id-a2f0-f95ccab82d92'
      })

    scenario.thenUnderlyingUseCaseNotExecuted(scenario.useCaseMock)
  })
})
