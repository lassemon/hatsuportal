import { describe, it, expect, beforeEach, vi, Mock } from 'vitest'
import { RemoveImageFromStoryUseCaseWithValidation } from './RemoveImageFromStoryUseCaseWithValidation'
import { RemoveImageFromStoryUseCase } from './RemoveImageFromStoryUseCase'
import { IRemoveImageFromStoryUseCaseOptions, RemoveImageFromStoryInputDTO, InvalidPostIdError } from '@hatsuportal/post-management'
import { AuthorizationError, NotFoundError } from '@hatsuportal/common-bounded-context'

const imageRemoved = vi.fn()

interface MockUseCaseOptions extends IRemoveImageFromStoryUseCaseOptions {
  removeImageFromStoryInput: RemoveImageFromStoryInputDTO
  imageRemoved: Mock
}

function createUseCaseOptions(removeImageFromStoryInput: RemoveImageFromStoryInputDTO): MockUseCaseOptions {
  return {
    removeImageFromStoryInput,
    imageRemoved
  }
}

describe('RemoveImageFromStoryUseCaseWithValidation', () => {
  beforeEach(() => imageRemoved.mockReset())

  it('should execute underlying use case when validations pass', async ({ unitFixture }) => {
    // Arrange
    const { transactionManagerMock } = unitFixture.transactionManagerFactory()
    const userRepositoryMock = unitFixture.userRepositoryMock()
    const storyRepositoryMock = unitFixture.storyRepositoryMock()
    const imageRepositoryMock = unitFixture.imageRepositoryMock()
    const authorizationServiceMock = unitFixture.authorizationServiceMock()

    const story = unitFixture.storyMock()
    storyRepositoryMock.findById = vi.fn().mockResolvedValue(story)
    authorizationServiceMock.canRemoveImageFromStory = vi.fn().mockReturnValue({ isAuthorized: true })

    const baseUseCase = new RemoveImageFromStoryUseCase(
      storyRepositoryMock,
      imageRepositoryMock,
      unitFixture.storyMapperMock({ dto: story.getProps() }),
      transactionManagerMock
    )

    const useCase = new RemoveImageFromStoryUseCaseWithValidation(
      baseUseCase,
      userRepositoryMock,
      storyRepositoryMock,
      authorizationServiceMock
    )

    const options = createUseCaseOptions({
      loggedInUserId: unitFixture.userDTOMock().id,
      storyIdFromWhichToRemoveImage: story.id.value
    })

    // Act
    await useCase.execute(options)

    // Assert
    expect(authorizationServiceMock.canRemoveImageFromStory).toHaveBeenCalled()
    expect(options.imageRemoved).toHaveBeenCalled()
  })

  it('should throw AuthorizationError when logged in user does not exist', async ({ unitFixture }) => {
    // Arrange
    const { transactionManagerMock } = unitFixture.transactionManagerFactory()
    const userRepositoryMock = unitFixture.userRepositoryMock()
    userRepositoryMock.findById = vi.fn().mockResolvedValue(null)

    const storyRepositoryMock = unitFixture.storyRepositoryMock()
    const imageRepositoryMock = unitFixture.imageRepositoryMock()
    const authorizationServiceMock = unitFixture.authorizationServiceMock()

    const story = unitFixture.storyMock()
    storyRepositoryMock.findById = vi.fn().mockResolvedValue(story)

    const baseUseCase = new RemoveImageFromStoryUseCase(
      storyRepositoryMock,
      imageRepositoryMock,
      unitFixture.storyMapperMock(),
      transactionManagerMock
    )
    const useCase = new RemoveImageFromStoryUseCaseWithValidation(
      baseUseCase,
      userRepositoryMock,
      storyRepositoryMock,
      authorizationServiceMock
    )

    const options = createUseCaseOptions({
      loggedInUserId: 'non-existent-user-id-a2f0-f95ccab82d92',
      storyIdFromWhichToRemoveImage: story.id.value
    })

    // Act & Assert
    await expect(useCase.execute(options)).rejects.toThrow(AuthorizationError)
    expect(options.imageRemoved).not.toHaveBeenCalled()
  })

  it('should throw NotFoundError when story does not exist', async ({ unitFixture }) => {
    // Arrange
    const { transactionManagerMock } = unitFixture.transactionManagerFactory()
    const userRepositoryMock = unitFixture.userRepositoryMock()
    const storyRepositoryMock = unitFixture.storyRepositoryMock()
    storyRepositoryMock.findById = vi.fn().mockResolvedValue(null)

    const imageRepositoryMock = unitFixture.imageRepositoryMock()
    const authorizationServiceMock = unitFixture.authorizationServiceMock()

    const baseUseCase = new RemoveImageFromStoryUseCase(
      storyRepositoryMock,
      imageRepositoryMock,
      unitFixture.storyMapperMock(),
      transactionManagerMock
    )
    const useCase = new RemoveImageFromStoryUseCaseWithValidation(
      baseUseCase,
      userRepositoryMock,
      storyRepositoryMock,
      authorizationServiceMock
    )

    const options = createUseCaseOptions({
      loggedInUserId: unitFixture.userDTOMock().id,
      storyIdFromWhichToRemoveImage: 'non-existent-story-id-a2f0-f95ccab82d92'
    })

    // Act & Assert
    await expect(useCase.execute(options)).rejects.toThrow(NotFoundError)
    expect(options.imageRemoved).not.toHaveBeenCalled()
  })

  it('should throw AuthorizationError when authorization fails', async ({ unitFixture }) => {
    // Arrange
    const { transactionManagerMock } = unitFixture.transactionManagerFactory()
    const userRepositoryMock = unitFixture.userRepositoryMock()
    const storyRepositoryMock = unitFixture.storyRepositoryMock()
    const imageRepositoryMock = unitFixture.imageRepositoryMock()
    const authorizationServiceMock = unitFixture.authorizationServiceMock()
    authorizationServiceMock.canRemoveImageFromStory = vi.fn().mockReturnValue({ isAuthorized: false, reason: 'Forbidden' })

    const story = unitFixture.storyMock()
    storyRepositoryMock.findById = vi.fn().mockResolvedValue(story)

    const baseUseCase = new RemoveImageFromStoryUseCase(
      storyRepositoryMock,
      imageRepositoryMock,
      unitFixture.storyMapperMock({ dto: story.getProps() }),
      transactionManagerMock
    )
    const useCase = new RemoveImageFromStoryUseCaseWithValidation(
      baseUseCase,
      userRepositoryMock,
      storyRepositoryMock,
      authorizationServiceMock
    )

    const options = createUseCaseOptions({
      loggedInUserId: unitFixture.userDTOMock().id,
      storyIdFromWhichToRemoveImage: story.id.value
    })

    // Act & Assert
    await expect(useCase.execute(options)).rejects.toThrow(AuthorizationError)
    expect(options.imageRemoved).not.toHaveBeenCalled()
  })

  it('should throw InvalidPostIdError when story id is invalid', async ({ unitFixture }) => {
    // Arrange
    const { transactionManagerMock } = unitFixture.transactionManagerFactory()
    const userRepositoryMock = unitFixture.userRepositoryMock()
    const storyRepositoryMock = unitFixture.storyRepositoryMock()
    const imageRepositoryMock = unitFixture.imageRepositoryMock()
    const authorizationServiceMock = unitFixture.authorizationServiceMock()

    const baseUseCase = new RemoveImageFromStoryUseCase(
      storyRepositoryMock,
      imageRepositoryMock,
      unitFixture.storyMapperMock(),
      transactionManagerMock
    )
    const useCase = new RemoveImageFromStoryUseCaseWithValidation(
      baseUseCase,
      userRepositoryMock,
      storyRepositoryMock,
      authorizationServiceMock
    )

    const options = createUseCaseOptions({
      loggedInUserId: unitFixture.userDTOMock().id,
      storyIdFromWhichToRemoveImage: 'invalid-id-a2f0-f95ccab82d92'
    })

    // Act & Assert
    await expect(useCase.execute(options)).rejects.toThrow(InvalidPostIdError)
    expect(options.imageRemoved).not.toHaveBeenCalled()
  })
})
