import { describe, it, vi, afterEach } from 'vitest'
import { FindStoryValidationScenario } from '../../../../__test__/support/story/FindStoryValidationScenario'
import { NotFoundError, AuthorizationError, InvalidInputError } from '@hatsuportal/platform'
import { VisibilityEnum } from '@hatsuportal/common'
import { IFindStoryUseCaseOptions } from './FindStoryUseCase'

describe('FindStoryUseCaseWithValidation', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  const baseInput = (userId: string, storyIdToFind: string): IFindStoryUseCaseOptions => ({
    loggedInUserId: userId,
    findStoryInput: {
      storyIdToFind
    },
    storyFound: vi.fn()
  })

  it('should execute underlying use case when validations pass', async ({ unitFixture }) => {
    const scenario = await FindStoryValidationScenario.given()
      .withLoggedInUser()
      .withExistingStory()
      .whenExecutedWithInput(baseInput(unitFixture.sampleUserId, unitFixture.storyDTOMock().id))

    scenario.thenUnderlyingUseCaseExecuted(scenario.useCaseMock)
  })

  it('should throw NotFoundError when story is not found', async ({ unitFixture }) => {
    const scenario = await FindStoryValidationScenario.given()
      .withLoggedInUser()
      .withoutExistingStory()
      .expectErrorOfType(NotFoundError)
      .whenExecutedWithInput(baseInput(unitFixture.sampleUserId, 'non-existent-story-a2f0-f95ccab82d92'))

    scenario.thenUnderlyingUseCaseNotExecuted(scenario.useCaseMock)
  })

  it('should throw AuthorizationError when authorization fails', async ({ unitFixture }) => {
    const scenario = await FindStoryValidationScenario.given()
      .withLoggedInUser()
      .withExistingStory()
      .authorizationWillFail('denied')
      .expectErrorOfType(AuthorizationError)
      .whenExecutedWithInput(baseInput(unitFixture.sampleUserId, unitFixture.storyDTOMock().id))

    scenario.thenUnderlyingUseCaseNotExecuted(scenario.useCaseMock)
  })

  it('authorizes as anonymous when supplied user id fails to load', async ({ unitFixture }) => {
    const unknownUserId = 'unknown-user-a2f0-f95ccab82d92'
    const scenario = await FindStoryValidationScenario.given()
      .withFailedUserLoad(unknownUserId)
      .withStoryReadModel({ visibility: VisibilityEnum.Public })
      .withActualAuthorizationService()
      .whenExecutedWithInput(baseInput(unknownUserId, unitFixture.storyDTOMock().id))

    scenario.thenUnderlyingUseCaseExecuted(scenario.useCaseMock)
  })

  it('denies viewing private story for non-author via real ABAC', async ({ unitFixture }) => {
    const scenario = await FindStoryValidationScenario.given()
      .withNonAuthorUser()
      .withStoryVisibility(VisibilityEnum.Private)
      .withActualAuthorizationService()
      .expectErrorOfType(AuthorizationError)
      .whenExecutedWithInput(baseInput(unitFixture.sampleNonAuthorUserId, unitFixture.storyDTOMock().id))

    scenario.thenUnderlyingUseCaseNotExecuted(scenario.useCaseMock)
  })

  it('denies viewing logged-in-only story for anonymous user via real ABAC', async ({ unitFixture }) => {
    const scenario = await FindStoryValidationScenario.given()
      .withStoryVisibility(VisibilityEnum.LoggedIn)
      .withActualAuthorizationService()
      .expectErrorOfType(AuthorizationError)
      .whenExecutedWithInput({
        findStoryInput: { storyIdToFind: unitFixture.storyDTOMock().id },
        storyFound: vi.fn()
      })

    scenario.thenUnderlyingUseCaseNotExecuted(scenario.useCaseMock)
  })

  it('should throw InvalidInputError when storyIdToFind is invalid', async ({ unitFixture }) => {
    const scenario = await FindStoryValidationScenario.given()
      .withLoggedInUser()
      .withExistingStory()
      .expectErrorOfType(InvalidInputError)
      .whenExecutedWithInput(baseInput(unitFixture.sampleUserId, 'invalid-id-a2f0-f95ccab82d92'))

    scenario.thenUnderlyingUseCaseNotExecuted(scenario.useCaseMock)
  })
})
