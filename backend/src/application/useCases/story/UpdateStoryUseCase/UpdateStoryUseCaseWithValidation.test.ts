import { describe, it, vi, afterEach } from 'vitest'
import { VisibilityEnum, BASE64_PREFIX } from '@hatsuportal/common'
import { AuthorizationError, NotFoundError, InvalidInputError } from '@hatsuportal/common-bounded-context'
import { UpdateStoryValidationScenario } from '../../../../__test__/support/story/UpdateStoryValidationScenario'

describe('UpdateStoryUseCaseWithValidation', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should execute underlying use case when all validations pass', async ({ unitFixture }) => {
    const scenario = await UpdateStoryValidationScenario.given()
      .withLoggedInUser()
      .withExistingStory()
      .whenExecutedWithInput({
        loggedInUserId: unitFixture.userDTOMock().id,
        updateStoryData: {
          id: unitFixture.storyDTOMock().id,
          name: 'Updated',
          description: 'Updated desc',
          visibility: unitFixture.storyDTOMock().visibility,
          image: null
        }
      })

    scenario.thenUnderlyingUseCaseExecuted(scenario.useCaseMock)
  })

  it('should throw AuthorizationError when logged in user is not found', async ({ unitFixture }) => {
    const scenario = await UpdateStoryValidationScenario.given()
      .withLoggedInUser()
      .withoutLoggedInUser()
      .expectErrorOfType(AuthorizationError)
      .whenExecutedWithInput({
        loggedInUserId: 'non-existent-user-id-a2f0-f95ccab82d92',
        updateStoryData: {
          id: unitFixture.storyDTOMock().id,
          name: 'Updated',
          description: 'Updated desc',
          visibility: unitFixture.storyDTOMock().visibility,
          image: null
        }
      })

    scenario.thenOutputBoundaryNotCalled('storyUpdated')
  })

  it('should throw NotFoundError when story does not exist', async ({ unitFixture }) => {
    const scenario = await UpdateStoryValidationScenario.given()
      .withLoggedInUser()
      .withoutExistingStory()
      .expectErrorOfType(NotFoundError)
      .whenExecutedWithInput({
        loggedInUserId: unitFixture.userDTOMock().id,
        updateStoryData: {
          id: 'non-existent-story-a2f0-f95ccab82d92',
          name: 'Updated',
          description: 'Updated desc',
          visibility: unitFixture.storyDTOMock().visibility,
          image: null
        }
      })

    scenario.thenOutputBoundaryNotCalled('storyUpdated')
  })

  it('should throw AuthorizationError when user is not allowed to update story', async ({ unitFixture }) => {
    const scenario = await UpdateStoryValidationScenario.given()
      .withLoggedInUser()
      .withExistingStory()
      .authorizationWillFail('denied')
      .expectErrorOfType(AuthorizationError)
      .whenExecutedWithInput({
        loggedInUserId: unitFixture.userDTOMock().id,
        updateStoryData: {
          id: unitFixture.storyDTOMock().id,
          name: 'Updated',
          description: 'Updated desc',
          visibility: unitFixture.storyDTOMock().visibility,
          image: null
        }
      })

    scenario.thenOutputBoundaryNotCalled('storyUpdated')
  })

  it('should throw InvalidInputError when updateStoryData.id is invalid', async ({ unitFixture }) => {
    const scenario = await UpdateStoryValidationScenario.given()
      .withLoggedInUser()
      .withExistingStory()
      .expectErrorOfType(InvalidInputError)
      .whenExecutedWithInput({
        loggedInUserId: unitFixture.userDTOMock().id,
        updateStoryData: {
          id: 'invalid-id-a2f0-f95ccab82d92',
          name: 'Updated',
          description: 'Updated desc',
          visibility: unitFixture.storyDTOMock().visibility,
          image: null
        }
      })

    scenario.thenOutputBoundaryNotCalled('storyUpdated')
  })

  it('should throw InvalidInputError when updateStoryData.visibility is invalid', async ({ unitFixture }) => {
    const scenario = await UpdateStoryValidationScenario.given()
      .withLoggedInUser()
      .withExistingStory()
      .expectErrorOfType(InvalidInputError)
      .whenExecutedWithInput({
        loggedInUserId: unitFixture.userDTOMock().id,
        updateStoryData: {
          id: unitFixture.storyDTOMock().id,
          name: 'Updated',
          description: 'Updated desc',
          visibility: 'invalid_visibility' as unknown as VisibilityEnum,
          image: null
        }
      })

    scenario.thenOutputBoundaryNotCalled('storyUpdated')
  })

  it('should throw InvalidInputError when updateStoryData.name is empty', async ({ unitFixture }) => {
    const scenario = await UpdateStoryValidationScenario.given()
      .withLoggedInUser()
      .withExistingStory()
      .expectErrorOfType(InvalidInputError)
      .whenExecutedWithInput({
        loggedInUserId: unitFixture.userDTOMock().id,
        updateStoryData: {
          id: unitFixture.storyDTOMock().id,
          name: '',
          description: 'Updated desc',
          visibility: unitFixture.storyDTOMock().visibility,
          image: null
        }
      })

    scenario.thenOutputBoundaryNotCalled('storyUpdated')
  })

  it('should throw InvalidInputError when updateStoryData.description is empty', async ({ unitFixture }) => {
    const scenario = await UpdateStoryValidationScenario.given()
      .withLoggedInUser()
      .withExistingStory()
      .expectErrorOfType(InvalidInputError)
      .whenExecutedWithInput({
        loggedInUserId: unitFixture.userDTOMock().id,
        updateStoryData: {
          id: unitFixture.storyDTOMock().id,
          name: 'Updated',
          description: '   ',
          visibility: unitFixture.storyDTOMock().visibility,
          image: null
        }
      })

    scenario.thenOutputBoundaryNotCalled('storyUpdated')
  })

  it('should throw InvalidInputError when updateStoryData.image.id is invalid', async ({ unitFixture }) => {
    const scenario = await UpdateStoryValidationScenario.given()
      .withLoggedInUser()
      .withExistingStory()
      .expectErrorOfType(InvalidInputError)
      .whenExecutedWithInput({
        loggedInUserId: unitFixture.userDTOMock().id,
        updateStoryData: {
          id: unitFixture.storyDTOMock().id,
          name: 'Updated',
          description: 'Updated desc',
          visibility: unitFixture.storyDTOMock().visibility,
          image: {
            id: 'invalid-image-id',
            mimeType: 'image/png',
            size: 123,
            base64: `${BASE64_PREFIX}AAA`
          }
        }
      })

    scenario.thenOutputBoundaryNotCalled('storyUpdated')
  })

  it('should throw InvalidInputError when updateStoryData.image.mimeType is invalid', async ({ unitFixture }) => {
    const scenario = await UpdateStoryValidationScenario.given()
      .withLoggedInUser()
      .withExistingStory()
      .expectErrorOfType(InvalidInputError)
      .whenExecutedWithInput({
        loggedInUserId: unitFixture.userDTOMock().id,
        updateStoryData: {
          id: unitFixture.storyDTOMock().id,
          name: 'Updated',
          description: 'Updated desc',
          visibility: unitFixture.storyDTOMock().visibility,
          image: {
            id: unitFixture.imageDTOMock().id,
            mimeType: 'not-valid-mime-type',
            size: 123,
            base64: `${BASE64_PREFIX}AAA`
          }
        }
      })

    scenario.thenOutputBoundaryNotCalled('storyUpdated')
  })

  it('should throw InvalidInputError when updateStoryData.image.size is not positive', async ({ unitFixture }) => {
    const scenario = await UpdateStoryValidationScenario.given()
      .withLoggedInUser()
      .withExistingStory()
      .expectErrorOfType(InvalidInputError)
      .whenExecutedWithInput({
        loggedInUserId: unitFixture.userDTOMock().id,
        updateStoryData: {
          id: unitFixture.storyDTOMock().id,
          name: 'Updated',
          description: 'Updated desc',
          visibility: unitFixture.storyDTOMock().visibility,
          image: {
            id: unitFixture.imageDTOMock().id,
            mimeType: 'image/png',
            size: -12,
            base64: `${BASE64_PREFIX}AAA`
          }
        }
      })

    scenario.thenOutputBoundaryNotCalled('storyUpdated')
  })

  it('should throw InvalidInputError when updateStoryData.image.base64 is invalid', async ({ unitFixture }) => {
    const scenario = await UpdateStoryValidationScenario.given()
      .withLoggedInUser()
      .withExistingStory()
      .expectErrorOfType(InvalidInputError)
      .whenExecutedWithInput({
        loggedInUserId: unitFixture.userDTOMock().id,
        updateStoryData: {
          id: unitFixture.storyDTOMock().id,
          name: 'Updated',
          description: 'Updated desc',
          visibility: unitFixture.storyDTOMock().visibility,
          image: {
            id: unitFixture.imageDTOMock().id,
            mimeType: 'image/png',
            size: 123,
            base64: 'not_base64'
          }
        }
      })

    scenario.thenOutputBoundaryNotCalled('storyUpdated')
  })
})
