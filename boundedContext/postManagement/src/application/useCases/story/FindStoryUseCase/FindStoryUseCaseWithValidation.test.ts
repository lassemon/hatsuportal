import { describe, it, vi, afterEach } from 'vitest'
import { FindStoryValidationScenario } from '../../../../__test__/support/story/FindStoryValidationScenario'
import { NotFoundError, AuthorizationError, InvalidInputError } from '@hatsuportal/platform'
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

  it('should throw NotFoundError when authorization fails', async ({ unitFixture }) => {
    const scenario = await FindStoryValidationScenario.given()
      .withLoggedInUser()
      .withExistingStory()
      .authorizationWillFail('denied')
      .expectErrorOfType(AuthorizationError)
      .whenExecutedWithInput(baseInput(unitFixture.sampleUserId, unitFixture.storyDTOMock().id))

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
