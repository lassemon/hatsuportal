import { describe, it, expect, beforeEach, vi, Mock } from 'vitest'
import { FindStoryUseCaseWithValidation } from './FindStoryUseCaseWithValidation'
import { FindStoryUseCase } from './FindStoryUseCase'
import { FindStoryInputDTO, IFindStoryUseCaseOptions, InvalidPostIdError } from '@hatsuportal/post-management'
import { NotFoundError } from '@hatsuportal/common-bounded-context'

const storyFound = vi.fn()

interface MockUseCaseOptions extends IFindStoryUseCaseOptions {
  findStoryInput: FindStoryInputDTO
  storyFound: Mock
}

function createUseCaseOptions(findStoryInput: FindStoryInputDTO): MockUseCaseOptions {
  return { findStoryInput, storyFound }
}

describe('FindStoryUseCaseWithValidation', () => {
  beforeEach(() => storyFound.mockReset())

  it('should execute underlying use case when validations pass', async ({ unitFixture }) => {
    // Arrange
    const storyRepositoryMock = unitFixture.storyRepositoryMock()
    const userRepositoryMock = unitFixture.userRepositoryMock()
    const authorizationServiceMock = unitFixture.authorizationServiceMock()

    const story = unitFixture.storyMock()
    storyRepositoryMock.findById = vi.fn().mockResolvedValue(story)
    authorizationServiceMock.canViewStory = vi.fn().mockReturnValue({ isAuthorized: true })

    const baseUseCase = new FindStoryUseCase(storyRepositoryMock, unitFixture.storyMapperMock())
    const useCase = new FindStoryUseCaseWithValidation(baseUseCase, userRepositoryMock, storyRepositoryMock, authorizationServiceMock)

    const options = createUseCaseOptions({ storyIdToFind: story.id.value, loggedInUserId: undefined })

    // Act
    await useCase.execute(options)

    // Assert
    expect(options.storyFound).toHaveBeenCalled()
  })

  it('should throw NotFoundError when story is not found', async ({ unitFixture }) => {
    // Arrange
    const storyRepositoryMock = unitFixture.storyRepositoryMock()
    const userRepositoryMock = unitFixture.userRepositoryMock()
    const authorizationServiceMock = unitFixture.authorizationServiceMock()

    storyRepositoryMock.findById = vi.fn().mockResolvedValue(null)

    const baseUseCase = new FindStoryUseCase(storyRepositoryMock, unitFixture.storyMapperMock())
    const useCase = new FindStoryUseCaseWithValidation(baseUseCase, userRepositoryMock, storyRepositoryMock, authorizationServiceMock)

    const options = createUseCaseOptions({ storyIdToFind: 'non-existent-story-a2f0-f95ccab82d92', loggedInUserId: undefined })

    // Act & Assert
    await expect(useCase.execute(options)).rejects.toThrow(NotFoundError)
    expect(options.storyFound).not.toHaveBeenCalled()
  })

  it('should throw NotFoundError when authorization fails', async ({ unitFixture }) => {
    // Arrange
    const storyRepositoryMock = unitFixture.storyRepositoryMock()
    const userRepositoryMock = unitFixture.userRepositoryMock()
    const authorizationServiceMock = unitFixture.authorizationServiceMock()

    const story = unitFixture.storyMock()
    storyRepositoryMock.findById = vi.fn().mockResolvedValue(story)
    authorizationServiceMock.canViewStory = vi.fn().mockReturnValue({ isAuthorized: false, reason: 'denied' })

    const baseUseCase = new FindStoryUseCase(storyRepositoryMock, unitFixture.storyMapperMock())
    const useCase = new FindStoryUseCaseWithValidation(baseUseCase, userRepositoryMock, storyRepositoryMock, authorizationServiceMock)

    const options = createUseCaseOptions({ storyIdToFind: story.id.value, loggedInUserId: 'some-user-id-9780-4a98-a2f0-f95ccab82d92' })

    // Act & Assert
    await expect(useCase.execute(options)).rejects.toThrow(NotFoundError)
    expect(options.storyFound).not.toHaveBeenCalled()
  })

  it('should throw InvalidPostIdError when storyIdToFind is invalid', async ({ unitFixture }) => {
    // Arrange
    const storyRepositoryMock = unitFixture.storyRepositoryMock()
    const userRepositoryMock = unitFixture.userRepositoryMock()
    const authorizationServiceMock = unitFixture.authorizationServiceMock()

    const baseUseCase = new FindStoryUseCase(storyRepositoryMock, unitFixture.storyMapperMock())
    const useCase = new FindStoryUseCaseWithValidation(baseUseCase, userRepositoryMock, storyRepositoryMock, authorizationServiceMock)

    const options = createUseCaseOptions({ storyIdToFind: 'invalid-id-a2f0-f95ccab82d92', loggedInUserId: undefined })

    // Act & Assert
    await expect(useCase.execute(options)).rejects.toThrow(InvalidPostIdError)
    expect(options.storyFound).not.toHaveBeenCalled()
  })
})
