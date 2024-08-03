import { describe, it, vi, afterEach } from 'vitest'
import { UpdateStoryValidationScenario } from '../../../../__test__/support/story/UpdateStoryValidationScenario'
import { AuthorizationError, NotFoundError, InvalidInputError, BASE64_PNG_PREFIX } from '@hatsuportal/platform'
import { VisibilityEnum } from '@hatsuportal/common'

describe('UpdateStoryUseCaseWithValidation', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should execute underlying use case when all validations pass', async ({ unitFixture }) => {
    const scenario = await UpdateStoryValidationScenario.given()
      .withLoggedInUser()
      .withExistingStory()
      .whenExecutedWithInput({
        updatedById: unitFixture.sampleUserId,
        updateStoryInput: {
          id: unitFixture.sampleStoryId,
          name: 'Updated',
          description: 'Updated desc',
          visibility: VisibilityEnum.Public,
          image: null,
          tags: []
        },
        storyUpdated: vi.fn(),
        updateConflict: vi.fn()
      })

    scenario.thenUnderlyingUseCaseExecuted(scenario.useCaseMock)
  })

  it('should throw AuthorizationError when logged in user is not found', async ({ unitFixture }) => {
    const scenario = await UpdateStoryValidationScenario.given()
      .withoutLoggedInUser()
      .expectErrorOfType(AuthorizationError)
      .whenExecutedWithInput({
        updatedById: 'non-existent-user-id-a2f0-f95ccab82d92',
        updateStoryInput: {
          id: unitFixture.sampleStoryId,
          name: 'Updated',
          description: 'Updated desc',
          visibility: VisibilityEnum.Public,
          image: null,
          tags: []
        },
        storyUpdated: vi.fn(),
        updateConflict: vi.fn()
      })

    scenario.thenOutputBoundaryNotCalled('storyUpdated')
  })

  it('should throw NotFoundError when story does not exist', async ({ unitFixture }) => {
    const scenario = await UpdateStoryValidationScenario.given()
      .withLoggedInUser()
      .withoutExistingStory()
      .expectErrorOfType(NotFoundError)
      .whenExecutedWithInput({
        updatedById: unitFixture.sampleUserId,
        updateStoryInput: {
          id: 'non-existent-story-a2f0-f95ccab82d92',
          name: 'Updated',
          description: 'Updated desc',
          visibility: VisibilityEnum.Public,
          image: null,
          tags: []
        },
        storyUpdated: vi.fn(),
        updateConflict: vi.fn()
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
        updatedById: unitFixture.sampleUserId,
        updateStoryInput: {
          id: unitFixture.sampleStoryId,
          name: 'Updated',
          description: 'Updated desc',
          visibility: VisibilityEnum.Public,
          image: null,
          tags: []
        },
        storyUpdated: vi.fn(),
        updateConflict: vi.fn()
      })

    scenario.thenOutputBoundaryNotCalled('storyUpdated')
  })

  it('should throw InvalidInputError when updateStoryData.id is invalid', async ({ unitFixture }) => {
    const scenario = await UpdateStoryValidationScenario.given()
      .withLoggedInUser()
      .withExistingStory()
      .expectErrorOfType(InvalidInputError)
      .whenExecutedWithInput({
        updatedById: unitFixture.sampleUserId,
        updateStoryInput: {
          id: 'invalid-id-a2f0-f95ccab82d92',
          name: 'Updated',
          description: 'Updated desc',
          visibility: VisibilityEnum.Public,
          image: null,
          tags: []
        },
        storyUpdated: vi.fn(),
        updateConflict: vi.fn()
      })

    scenario.thenOutputBoundaryNotCalled('storyUpdated')
  })

  it('should throw InvalidInputError when updateStoryData.visibility is invalid', async ({ unitFixture }) => {
    const scenario = await UpdateStoryValidationScenario.given()
      .withLoggedInUser()
      .withExistingStory()
      .expectErrorOfType(InvalidInputError)
      .whenExecutedWithInput({
        updatedById: unitFixture.sampleUserId,
        updateStoryInput: {
          id: unitFixture.sampleStoryId,
          name: 'Updated',
          description: 'Updated desc',
          visibility: 'invalid_visibility' as unknown as VisibilityEnum,
          image: null,
          tags: []
        },
        storyUpdated: vi.fn(),
        updateConflict: vi.fn()
      })

    scenario.thenOutputBoundaryNotCalled('storyUpdated')
  })

  it('should throw InvalidInputError when updateStoryData.name is empty', async ({ unitFixture }) => {
    const scenario = await UpdateStoryValidationScenario.given()
      .withLoggedInUser()
      .withExistingStory()
      .expectErrorOfType(InvalidInputError)
      .whenExecutedWithInput({
        updatedById: unitFixture.sampleUserId,
        updateStoryInput: {
          id: unitFixture.sampleStoryId,
          name: '',
          description: 'Updated desc',
          visibility: VisibilityEnum.Public,
          image: null,
          tags: []
        },
        storyUpdated: vi.fn(),
        updateConflict: vi.fn()
      })

    scenario.thenOutputBoundaryNotCalled('storyUpdated')
  })

  it('should throw InvalidInputError when updateStoryData.description is empty', async ({ unitFixture }) => {
    const scenario = await UpdateStoryValidationScenario.given()
      .withLoggedInUser()
      .withExistingStory()
      .expectErrorOfType(InvalidInputError)
      .whenExecutedWithInput({
        updatedById: unitFixture.sampleUserId,
        updateStoryInput: {
          id: unitFixture.sampleStoryId,
          name: 'Updated',
          description: '   ',
          visibility: VisibilityEnum.Public,
          image: null
        },
        storyUpdated: vi.fn(),
        updateConflict: vi.fn()
      })

    scenario.thenOutputBoundaryNotCalled('storyUpdated')
  })

  it('should throw InvalidInputError when updateStoryData.image.mimeType is invalid', async ({ unitFixture }) => {
    const scenario = await UpdateStoryValidationScenario.given()
      .withLoggedInUser()
      .withExistingStory()
      .expectErrorOfType(InvalidInputError)
      .whenExecutedWithInput({
        updatedById: unitFixture.sampleUserId,
        updateStoryInput: {
          id: unitFixture.sampleStoryId,
          name: 'Updated',
          description: 'Updated desc',
          visibility: VisibilityEnum.Public,
          image: {
            mimeType: '',
            size: 123,
            base64: `${BASE64_PNG_PREFIX}AAA`
          }
        },
        storyUpdated: vi.fn(),
        updateConflict: vi.fn()
      })

    scenario.thenOutputBoundaryNotCalled('storyUpdated')
  })

  it('should throw InvalidInputError when updateStoryData.image.size is not positive', async ({ unitFixture }) => {
    const scenario = await UpdateStoryValidationScenario.given()
      .withLoggedInUser()
      .withExistingStory()
      .expectErrorOfType(InvalidInputError)
      .whenExecutedWithInput({
        updatedById: unitFixture.sampleUserId,
        updateStoryInput: {
          id: unitFixture.sampleStoryId,
          name: 'Updated',
          description: 'Updated desc',
          visibility: VisibilityEnum.Public,
          image: {
            mimeType: 'image/png',
            size: -12,
            base64: `${BASE64_PNG_PREFIX}AAA`
          }
        },
        storyUpdated: vi.fn(),
        updateConflict: vi.fn()
      })

    scenario.thenOutputBoundaryNotCalled('storyUpdated')
  })

  it('should throw InvalidInputError when updateStoryData.image.base64 is invalid', async ({ unitFixture }) => {
    const scenario = await UpdateStoryValidationScenario.given()
      .withLoggedInUser()
      .withExistingStory()
      .expectErrorOfType(InvalidInputError)
      .whenExecutedWithInput({
        updatedById: unitFixture.sampleUserId,
        updateStoryInput: {
          id: unitFixture.sampleStoryId,
          name: 'Updated',
          description: 'Updated desc',
          visibility: VisibilityEnum.Public,
          image: {
            mimeType: 'image/png',
            size: 123,
            base64: ''
          }
        },
        storyUpdated: vi.fn(),
        updateConflict: vi.fn()
      })

    scenario.thenOutputBoundaryNotCalled('storyUpdated')
  })
})
