import { describe, it, vi, afterEach } from 'vitest'
import { RemoveImageFromStoryValidationScenario } from '../../../../__test__/support/story/RemoveImageFromStoryValidationScenario'
import { AuthorizationError, NotFoundError } from '@hatsuportal/platform'
import { InvalidPostIdError } from '../../../../domain'

describe('RemoveImageFromStoryUseCaseWithValidation', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should execute underlying use case when validations pass', async ({ unitFixture }) => {
    const scenario = await RemoveImageFromStoryValidationScenario.given()
      .withLoggedInUser()
      .withExistingStory()
      .whenExecutedWithInput({
        removedById: unitFixture.sampleUserId,
        removeImageFromStoryInput: {
          storyIdFromWhichToRemoveImage: unitFixture.storyDTOMock().id
        },
        imageRemoved: vi.fn()
      })

    scenario.thenUnderlyingUseCaseExecuted(scenario.useCaseMock)
  })

  it('should throw AuthorizationError when logged in user does not exist', async ({ unitFixture }) => {
    const scenario = await RemoveImageFromStoryValidationScenario.given()
      .withoutLoggedInUser()
      .withExistingStory()
      .expectErrorOfType(AuthorizationError)
      .whenExecutedWithInput({
        removedById: unitFixture.sampleUserId,
        removeImageFromStoryInput: {
          storyIdFromWhichToRemoveImage: unitFixture.storyDTOMock().id
        },
        imageRemoved: vi.fn()
      })

    scenario.thenUnderlyingUseCaseNotExecuted(scenario.useCaseMock)
  })

  it('should throw NotFoundError when story does not exist', async ({ unitFixture }) => {
    const scenario = await RemoveImageFromStoryValidationScenario.given()
      .withLoggedInUser()
      .withoutExistingStory()
      .expectErrorOfType(NotFoundError)
      .whenExecutedWithInput({
        removedById: unitFixture.sampleUserId,
        removeImageFromStoryInput: {
          storyIdFromWhichToRemoveImage: unitFixture.storyDTOMock().id
        },
        imageRemoved: vi.fn()
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
        removedById: unitFixture.sampleUserId,
        removeImageFromStoryInput: {
          storyIdFromWhichToRemoveImage: unitFixture.storyDTOMock().id
        },
        imageRemoved: vi.fn()
      })

    scenario.thenUnderlyingUseCaseNotExecuted(scenario.useCaseMock)
  })

  it('should throw InvalidPostIdError when story id is invalid', async ({ unitFixture }) => {
    const scenario = await RemoveImageFromStoryValidationScenario.given()
      .withLoggedInUser()
      .withExistingStory()
      .expectErrorOfType(InvalidPostIdError)
      .whenExecutedWithInput({
        removedById: unitFixture.sampleUserId,
        removeImageFromStoryInput: {
          storyIdFromWhichToRemoveImage: 'invalid-id'
        },
        imageRemoved: vi.fn()
      })

    scenario.thenUnderlyingUseCaseNotExecuted(scenario.useCaseMock)
  })
})
