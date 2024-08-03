import { describe, it, expect, beforeEach, vi, Mock } from 'vitest'
import { UpdateStoryUseCaseWithValidation } from './UpdateStoryUseCaseWithValidation'
import { UpdateStoryUseCase } from './UpdateStoryUseCase'
import { IUpdateStoryUseCaseOptions, UpdateStoryInputDTO, InvalidPostIdError } from '@hatsuportal/post-management'
import { AuthorizationError, NotFoundError } from '@hatsuportal/common-bounded-context'

const storyUpdated = vi.fn()
const updateConflict = vi.fn()

interface MockUseCaseOptions extends IUpdateStoryUseCaseOptions {
  updateStoryInput: UpdateStoryInputDTO
  storyUpdated: Mock
  updateConflict: Mock
}

function createUseCaseOptions(updateStoryInput: UpdateStoryInputDTO): MockUseCaseOptions {
  return {
    updateStoryInput,
    storyUpdated,
    updateConflict
  }
}

describe('UpdateStoryUseCaseWithValidation', () => {
  beforeEach(() => {
    storyUpdated.mockReset()
    updateConflict.mockReset()
  })

  it('should execute underlying use case when all validations pass', async ({ unitFixture }) => {
    // Arrange
    const userRepositoryMock = unitFixture.userRepositoryMock()
    const { transactionManagerMock } = unitFixture.transactionManagerFactory()
    const storyRepositoryMock = unitFixture.storyRepositoryMock()
    const imageRepositoryMock = unitFixture.imageRepositoryMock()
    const authorizationServiceMock = unitFixture.authorizationServiceMock()

    const story = unitFixture.storyMock()
    storyRepositoryMock.findById = vi.fn().mockResolvedValue(story)
    authorizationServiceMock.canUpdateStory = vi.fn().mockReturnValue({ isAuthorized: true })

    const options = createUseCaseOptions({
      loggedInUserId: unitFixture.userDTOMock().id,
      updateStoryData: {
        id: story.id.value,
        name: 'Updated',
        description: 'Updated desc',
        visibility: story.visibility.value,
        image: null
      }
    })

    const baseUseCase = new UpdateStoryUseCase(
      imageRepositoryMock,
      storyRepositoryMock,
      unitFixture.storyMapperMock(),
      transactionManagerMock
    )
    const useCase = new UpdateStoryUseCaseWithValidation(baseUseCase, userRepositoryMock, storyRepositoryMock, authorizationServiceMock)

    // Act
    await useCase.execute(options)

    // Assert
    expect(storyUpdated).toHaveBeenCalled()
    expect(authorizationServiceMock.canUpdateStory).toHaveBeenCalled()
  })

  it('should throw AuthorizationError when logged in user is not found', async ({ unitFixture }) => {
    // Arrange
    const userRepositoryMock = unitFixture.userRepositoryMock()
    const { transactionManagerMock } = unitFixture.transactionManagerFactory()
    const storyRepositoryMock = unitFixture.storyRepositoryMock()
    const imageRepositoryMock = unitFixture.imageRepositoryMock()
    const authorizationServiceMock = unitFixture.authorizationServiceMock()

    userRepositoryMock.findById = vi.fn().mockResolvedValue(null)

    const story = unitFixture.storyMock()
    storyRepositoryMock.findById = vi.fn().mockResolvedValue(story)

    const options = createUseCaseOptions({
      loggedInUserId: 'non-existent-user-id-a2f0-f95ccab82d92',
      updateStoryData: {
        id: story.id.value,
        name: 'Updated',
        description: 'Updated desc',
        visibility: story.visibility.value,
        image: null
      }
    })

    const baseUseCase = new UpdateStoryUseCase(
      imageRepositoryMock,
      storyRepositoryMock,
      unitFixture.storyMapperMock(),
      transactionManagerMock
    )
    const useCase = new UpdateStoryUseCaseWithValidation(baseUseCase, userRepositoryMock, storyRepositoryMock, authorizationServiceMock)

    // Act & Assert
    await expect(useCase.execute(options)).rejects.toThrow(AuthorizationError)
    expect(storyUpdated).not.toHaveBeenCalled()
  })

  it('should throw NotFoundError when story does not exist', async ({ unitFixture }) => {
    // Arrange
    const userRepositoryMock = unitFixture.userRepositoryMock()
    const { transactionManagerMock } = unitFixture.transactionManagerFactory()
    const storyRepositoryMock = unitFixture.storyRepositoryMock()
    const imageRepositoryMock = unitFixture.imageRepositoryMock()
    const authorizationServiceMock = unitFixture.authorizationServiceMock()

    const user = unitFixture.userMock()
    userRepositoryMock.findById = vi.fn().mockResolvedValue(user)
    storyRepositoryMock.findById = vi.fn().mockResolvedValue(null)

    const options = createUseCaseOptions({
      loggedInUserId: user.id.value,
      updateStoryData: {
        id: 'non-existent-story-a2f0-f95ccab82d92',
        name: 'Updated',
        description: 'Updated desc',
        visibility: unitFixture.storyDTOMock().visibility,
        image: null
      }
    })

    const baseUseCase = new UpdateStoryUseCase(
      imageRepositoryMock,
      storyRepositoryMock,
      unitFixture.storyMapperMock(),
      transactionManagerMock
    )
    const useCase = new UpdateStoryUseCaseWithValidation(baseUseCase, userRepositoryMock, storyRepositoryMock, authorizationServiceMock)

    // Act & Assert
    await expect(useCase.execute(options)).rejects.toThrow(NotFoundError)
    expect(storyUpdated).not.toHaveBeenCalled()
  })

  it('should throw AuthorizationError when user is not allowed to update story', async ({ unitFixture }) => {
    // Arrange
    const userRepositoryMock = unitFixture.userRepositoryMock()
    const { transactionManagerMock } = unitFixture.transactionManagerFactory()
    const storyRepositoryMock = unitFixture.storyRepositoryMock()
    const imageRepositoryMock = unitFixture.imageRepositoryMock()
    const authorizationServiceMock = unitFixture.authorizationServiceMock()

    const story = unitFixture.storyMock()
    storyRepositoryMock.findById = vi.fn().mockResolvedValue(story)

    const user = unitFixture.userMock()
    userRepositoryMock.findById = vi.fn().mockResolvedValue(user)
    authorizationServiceMock.canUpdateStory = vi.fn().mockReturnValue({ isAuthorized: false, reason: 'denied' })

    const options = createUseCaseOptions({
      loggedInUserId: user.id.value,
      updateStoryData: {
        id: story.id.value,
        name: 'Updated',
        description: 'Updated desc',
        visibility: story.visibility.value,
        image: null
      }
    })

    const baseUseCase = new UpdateStoryUseCase(
      imageRepositoryMock,
      storyRepositoryMock,
      unitFixture.storyMapperMock(),
      transactionManagerMock
    )
    const useCase = new UpdateStoryUseCaseWithValidation(baseUseCase, userRepositoryMock, storyRepositoryMock, authorizationServiceMock)

    // Act & Assert
    await expect(useCase.execute(options)).rejects.toThrow(AuthorizationError)
    expect(storyUpdated).not.toHaveBeenCalled()
  })

  it('should throw InvalidPostIdError when updateStoryData.id is invalid', async ({ unitFixture }) => {
    // Arrange
    const userRepositoryMock = unitFixture.userRepositoryMock()
    const { transactionManagerMock } = unitFixture.transactionManagerFactory()
    const storyRepositoryMock = unitFixture.storyRepositoryMock()
    const imageRepositoryMock = unitFixture.imageRepositoryMock()
    const authorizationServiceMock = unitFixture.authorizationServiceMock()

    const user = unitFixture.userMock()
    userRepositoryMock.findById = vi.fn().mockResolvedValue(user)

    const options = createUseCaseOptions({
      loggedInUserId: user.id.value,
      updateStoryData: {
        id: 'invalid-id-a2f0-f95ccab82d92',
        name: 'Updated',
        description: 'Updated desc',
        visibility: unitFixture.storyDTOMock().visibility,
        image: null
      }
    })

    const baseUseCase = new UpdateStoryUseCase(
      imageRepositoryMock,
      storyRepositoryMock,
      unitFixture.storyMapperMock(),
      transactionManagerMock
    )
    const useCase = new UpdateStoryUseCaseWithValidation(baseUseCase, userRepositoryMock, storyRepositoryMock, authorizationServiceMock)

    // Act & Assert
    await expect(useCase.execute(options)).rejects.toThrow(InvalidPostIdError)
    expect(storyUpdated).not.toHaveBeenCalled()
  })
})
