import { describe, it, vi, afterEach } from 'vitest'
import { DeletestoryValidationScenario } from '../../../../__test__/support/story/DeleteStoryValidationScenario'
import { AuthorizationError, NotFoundError } from '@hatsuportal/platform'

describe('DeleteStoryUseCaseWithValidation', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should successfully execute delete story use case when all validations pass', async ({ unitFixture }) => {
    const scenario = await DeletestoryValidationScenario.given()
      .withLoggedInUser()
      .withExistingStory()
      .whenExecutedWithInput({
        deletedById: unitFixture.sampleUserId,
        deleteStoryInput: {
          storyIdToDelete: unitFixture.storyDTOMock().id
        },
        storyDeleted: vi.fn(),
        deleteConflict: vi.fn()
      })

    scenario.thenUnderlyingUseCaseExecuted(scenario.useCaseMock)
  })

  it('should throw AuthorizationError if loggedInUserId does not exist', async ({ unitFixture }) => {
    const scenario = await DeletestoryValidationScenario.given()
      .withoutLoggedInUser()
      .withExistingStory()
      .expectErrorOfType(AuthorizationError)
      .whenExecutedWithInput({
        deletedById: unitFixture.sampleUserId,
        deleteStoryInput: {
          storyIdToDelete: unitFixture.storyDTOMock().id
        },
        storyDeleted: vi.fn(),
        deleteConflict: vi.fn()
      })

    scenario.thenUnderlyingUseCaseNotExecuted(scenario.useCaseMock)
  })

  it('should throw NotFoundError if story does not exist', async ({ unitFixture }) => {
    const scenario = await DeletestoryValidationScenario.given()
      .withLoggedInUser()
      .withoutExistingStory()
      .expectErrorOfType(NotFoundError)
      .whenExecutedWithInput({
        deletedById: unitFixture.sampleUserId,
        deleteStoryInput: {
          storyIdToDelete: unitFixture.storyDTOMock().id
        },
        storyDeleted: vi.fn(),
        deleteConflict: vi.fn()
      })

    scenario.thenUnderlyingUseCaseNotExecuted(scenario.useCaseMock)
  })

  it('should throw AuthorizationError if user is not allowed to delete the story', async ({ unitFixture }) => {
    const scenario = await DeletestoryValidationScenario.given()
      .withLoggedInUser()
      .withExistingStory()
      .authorizationWillFail('Forbidden')
      .expectErrorOfType(AuthorizationError)
      .whenExecutedWithInput({
        deletedById: unitFixture.sampleUserId,
        deleteStoryInput: {
          storyIdToDelete: unitFixture.storyDTOMock().id
        },
        storyDeleted: vi.fn(),
        deleteConflict: vi.fn()
      })

    scenario.thenUnderlyingUseCaseNotExecuted(scenario.useCaseMock)
  })
})
