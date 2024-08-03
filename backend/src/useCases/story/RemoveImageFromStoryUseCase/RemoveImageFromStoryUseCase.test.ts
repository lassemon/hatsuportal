import { describe, it, expect, beforeEach, vi, Mock } from 'vitest'
import { RemoveImageFromStoryUseCase } from './RemoveImageFromStoryUseCase'
import { ImageRemovedFromStoryEvent, IRemoveImageFromStoryUseCaseOptions, RemoveImageFromStoryInputDTO } from '@hatsuportal/post-management'
import { NotFoundError } from '@hatsuportal/common-bounded-context'

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

describe('RemoveImageFromStoryUseCase', () => {
  beforeEach(() => {
    imageRemoved.mockReset()
  })

  it('should remove image from story when it exists and emit expected domain events', async ({ unitFixture }) => {
    // Arrange
    const { transactionManagerMock, domainEventDispatcherMock } = unitFixture.transactionManagerFactory()
    const storyRepositoryMock = unitFixture.storyRepositoryMock()
    const imageRepositoryMock = unitFixture.imageRepositoryMock()

    const storyWithImage = unitFixture.storyMock()
    storyWithImage.clearEvents()
    storyRepositoryMock.findById = vi.fn().mockResolvedValue(storyWithImage)
    storyRepositoryMock.update = vi.fn().mockImplementation((entity) => Promise.resolve(entity))

    const options = createUseCaseOptions({
      loggedInUserId: unitFixture.userDTOMock().id,
      storyIdFromWhichToRemoveImage: storyWithImage.id.value
    })

    const useCase = new RemoveImageFromStoryUseCase(
      storyRepositoryMock,
      imageRepositoryMock,
      unitFixture.storyMapperMock(),
      transactionManagerMock
    )

    // Act
    await useCase.execute(options)

    // Assert
    expect(options.imageRemoved).toHaveBeenCalled()
    expect(domainEventDispatcherMock.dispatch).toHaveBeenCalledWith(expect.any(ImageRemovedFromStoryEvent))
  })

  it('should handle stories without image gracefully and not to emit domain events', async ({ unitFixture }) => {
    // Arrange
    const { transactionManagerMock, domainEventDispatcherMock } = unitFixture.transactionManagerFactory()
    const storyRepositoryMock = unitFixture.storyRepositoryMock()
    const imageRepositoryMock = unitFixture.imageRepositoryMock()

    const storyWithoutImage = unitFixture.storyMockWithoutImage()
    storyWithoutImage.clearEvents()
    storyRepositoryMock.findById = vi.fn().mockResolvedValue(storyWithoutImage)

    const options = createUseCaseOptions({
      loggedInUserId: unitFixture.userDTOMock().id,
      storyIdFromWhichToRemoveImage: storyWithoutImage.id.value
    })

    const useCase = new RemoveImageFromStoryUseCase(
      storyRepositoryMock,
      imageRepositoryMock,
      unitFixture.storyMapperMock({ dto: storyWithoutImage.getProps() }),
      transactionManagerMock
    )

    // Act
    await useCase.execute(options)

    // Assert
    expect(options.imageRemoved).toHaveBeenCalled()
    expect(domainEventDispatcherMock.dispatch).not.toHaveBeenCalled()
  })

  it('should throw NotFoundError when story does not exist', async ({ unitFixture }) => {
    // Arrange
    const { transactionManagerMock, domainEventDispatcherMock } = unitFixture.transactionManagerFactory()
    const storyRepositoryMock = unitFixture.storyRepositoryMock()
    const imageRepositoryMock = unitFixture.imageRepositoryMock()

    storyRepositoryMock.findById = vi.fn().mockResolvedValue(null)

    const options = createUseCaseOptions({
      loggedInUserId: unitFixture.userDTOMock().id,
      storyIdFromWhichToRemoveImage: 'non-existent-story-id-a2f0-f95ccab82d92'
    })

    const useCase = new RemoveImageFromStoryUseCase(
      storyRepositoryMock,
      imageRepositoryMock,
      unitFixture.storyMapperMock(),
      transactionManagerMock
    )

    // Act & Assert
    await expect(useCase.execute(options)).rejects.toThrow(NotFoundError)
    expect(options.imageRemoved).not.toHaveBeenCalled()
    expect(domainEventDispatcherMock.dispatch).not.toHaveBeenCalled()
  })

  it('should propagate unknown errors and not call callback', async ({ unitFixture }) => {
    // Arrange
    const { transactionManagerMock, domainEventDispatcherMock } = unitFixture.transactionManagerFactory()
    const storyRepositoryMock = unitFixture.storyRepositoryMock()
    const imageRepositoryMock = unitFixture.imageRepositoryMock()

    storyRepositoryMock.findById = vi.fn().mockRejectedValue(new Error('Database error'))

    const options = createUseCaseOptions({
      loggedInUserId: unitFixture.userDTOMock().id,
      storyIdFromWhichToRemoveImage: unitFixture.storyDTOMock().id
    })

    const useCase = new RemoveImageFromStoryUseCase(
      storyRepositoryMock,
      imageRepositoryMock,
      unitFixture.storyMapperMock(),
      transactionManagerMock
    )

    // Act & Assert
    await expect(useCase.execute(options)).rejects.toThrow(Error)
    expect(options.imageRemoved).not.toHaveBeenCalled()
    expect(domainEventDispatcherMock.dispatch).not.toHaveBeenCalled()
  })
})
