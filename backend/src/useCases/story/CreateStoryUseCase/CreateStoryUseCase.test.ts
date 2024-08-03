import { describe, it, expect, beforeEach, vi, Mocked, Mock, afterEach } from 'vitest'
import { CreateStoryUseCase } from './CreateStoryUseCase'
import { IDomainEventDispatcher, ImageCreatedEvent } from '@hatsuportal/common-bounded-context'
import {
  StoryCreatedEvent,
  ImageAddedToStoryEvent,
  ICreateStoryUseCaseOptions,
  CreateStoryImageInputDTO,
  CreateStoryInputDTO
} from '@hatsuportal/post-management'
import { VisibilityEnum } from '@hatsuportal/common'
import { StoryFactory } from '../../../infrastructure/services/story/StoryFactory'

const storyCreated = vi.fn()

interface MockUseCaseOptions extends ICreateStoryUseCaseOptions {
  createStoryInput: CreateStoryInputDTO
  storyCreated: Mock
}

function createUseCaseOptions(createStoryInput: CreateStoryInputDTO): MockUseCaseOptions {
  return {
    createStoryInput,
    storyCreated
  }
}

describe('CreateStoryUseCase', () => {
  let domainEventDispatcherMock: Mocked<IDomainEventDispatcher>

  beforeEach(({ unitFixture }) => {
    domainEventDispatcherMock = unitFixture.domainEventDispatcherMock()
    storyCreated.mockReset()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should create a story successfully', async ({ unitFixture }) => {
    // Arrange
    const { transactionManagerMock, executeSpy } = unitFixture.transactionManagerFactory()
    const storyRepositoryMock = unitFixture.storyRepositoryMock()

    const options = createUseCaseOptions({
      loggedInUserId: unitFixture.userDTOMock().id,
      createStoryData: {
        name: 'Test Story',
        description: 'Test Description',
        visibility: VisibilityEnum.Public,
        image: null
      }
    })

    const useCase = new CreateStoryUseCase(
      unitFixture.userRepositoryMock(),
      unitFixture.imageRepositoryMock(),
      storyRepositoryMock,
      unitFixture.storyMapperMock({ dto: options.createStoryInput.createStoryData }),
      unitFixture.storyFactoryMock(),
      transactionManagerMock,
      domainEventDispatcherMock
    )

    // Act
    await useCase.execute(options)

    // Assert
    expect(options.storyCreated).toHaveBeenCalledWith(options.createStoryInput.createStoryData)
    expect(executeSpy).toHaveBeenCalled()
    expect(storyRepositoryMock.insert).toHaveBeenCalled()
    expect(domainEventDispatcherMock.dispatch).toHaveBeenCalledWith(expect.any(StoryCreatedEvent))
  })

  it('should create a story with image successfully', async ({ unitFixture }) => {
    // Arrange
    const { transactionManagerMock } = unitFixture.transactionManagerFactory()
    const storyRepositoryMock = unitFixture.storyRepositoryMock()

    const imageInput: CreateStoryImageInputDTO = {
      mimeType: 'image/jpeg',
      size: 1024,
      base64: 'test-base64'
    }

    const options = createUseCaseOptions({
      loggedInUserId: unitFixture.userDTOMock().id,
      createStoryData: {
        name: 'Test Story',
        description: 'Test Description',
        visibility: VisibilityEnum.Public,
        image: imageInput
      }
    })

    const useCase = new CreateStoryUseCase(
      unitFixture.userRepositoryMock(),
      unitFixture.imageRepositoryMock(),
      storyRepositoryMock,
      unitFixture.storyMapperMock({ dto: options.createStoryInput.createStoryData }),
      unitFixture.storyFactoryMock(),
      transactionManagerMock,
      domainEventDispatcherMock
    )

    // Act
    await useCase.execute(options)

    // Assert
    expect(options.storyCreated).toHaveBeenCalledWith(options.createStoryInput.createStoryData)
    expect(transactionManagerMock.execute).toHaveBeenCalled()
    expect(storyRepositoryMock.insert).toHaveBeenCalled()
    expect(domainEventDispatcherMock.dispatch).toHaveBeenCalledWith(expect.any(StoryCreatedEvent))
    expect(domainEventDispatcherMock.dispatch).toHaveBeenCalledWith(expect.any(ImageAddedToStoryEvent))
  })

  it('should dispatch StoryCreatedEvent', async ({ unitFixture }) => {
    // Arrange
    const options = createUseCaseOptions({
      loggedInUserId: unitFixture.userDTOMock().id,
      createStoryData: {
        name: 'Test Story',
        description: 'Test Description',
        visibility: VisibilityEnum.Public,
        image: null
      }
    })
    const { transactionManagerMock } = unitFixture.transactionManagerFactory()
    const storyRepositoryMock = unitFixture.storyRepositoryMock()
    storyRepositoryMock.insert = vi.fn().mockResolvedValue(unitFixture.storyMockWithoutImage())
    const imageRepositoryMock = unitFixture.imageRepositoryMock()

    const useCase = new CreateStoryUseCase(
      unitFixture.userRepositoryMock(),
      imageRepositoryMock,
      storyRepositoryMock,
      unitFixture.storyMapperMock({ dto: options.createStoryInput.createStoryData }),
      new StoryFactory(),
      transactionManagerMock,
      domainEventDispatcherMock
    )

    // Act
    await useCase.execute(options)

    // Assert
    expect(domainEventDispatcherMock.dispatch).toHaveBeenCalledWith(expect.any(StoryCreatedEvent))
    expect(domainEventDispatcherMock.dispatch).toHaveBeenCalledTimes(1)
  })

  it('should dispatch proper image related domain events when image is provided', async ({ unitFixture }) => {
    // Arrange
    const { transactionManagerMock } = unitFixture.transactionManagerFactory()
    const storyRepositoryMock = unitFixture.storyRepositoryMock()
    const imageRepositoryMock = unitFixture.imageRepositoryMock()

    const options = createUseCaseOptions({
      loggedInUserId: unitFixture.userDTOMock().id,
      createStoryData: {
        name: 'Test Story',
        description: 'Test Description',
        visibility: VisibilityEnum.Public,
        image: {
          mimeType: 'image/jpeg',
          size: 1024,
          base64: 'test-base64'
        }
      }
    })

    const useCase = new CreateStoryUseCase(
      unitFixture.userRepositoryMock(),
      imageRepositoryMock,
      storyRepositoryMock,
      unitFixture.storyMapperMock({ dto: options.createStoryInput.createStoryData }),
      unitFixture.storyFactoryMock(),
      transactionManagerMock,
      domainEventDispatcherMock
    )

    // Act
    await useCase.execute(options)

    // Assert
    expect(domainEventDispatcherMock.dispatch).toHaveBeenCalledWith(expect.any(StoryCreatedEvent))
    expect(domainEventDispatcherMock.dispatch).toHaveBeenCalledWith(expect.any(ImageCreatedEvent))
    expect(domainEventDispatcherMock.dispatch).toHaveBeenCalledWith(expect.any(ImageAddedToStoryEvent))
    expect(domainEventDispatcherMock.dispatch).toHaveBeenCalledTimes(3)
  })

  it('should not dispatch image related domain events when image is not provided', async ({ unitFixture }) => {
    // Arrange
    const { transactionManagerMock } = unitFixture.transactionManagerFactory()
    const storyRepositoryMock = unitFixture.storyRepositoryMock()
    storyRepositoryMock.insert = vi.fn().mockResolvedValue(unitFixture.storyMockWithoutImage())
    const imageRepositoryMock = unitFixture.imageRepositoryMock()

    const options = createUseCaseOptions({
      loggedInUserId: unitFixture.userDTOMock().id,
      createStoryData: {
        name: 'Test Story',
        description: 'Test Description',
        visibility: VisibilityEnum.Public,
        image: null
      }
    })

    const useCase = new CreateStoryUseCase(
      unitFixture.userRepositoryMock(),
      imageRepositoryMock,
      storyRepositoryMock,
      unitFixture.storyMapperMock({ dto: options.createStoryInput.createStoryData }),
      new StoryFactory(),
      transactionManagerMock,
      domainEventDispatcherMock
    )

    // Act
    await useCase.execute(options)

    // Assert
    expect(domainEventDispatcherMock.dispatch).toHaveBeenCalledWith(expect.any(StoryCreatedEvent))
    expect(domainEventDispatcherMock.dispatch).not.toHaveBeenCalledWith(expect.any(ImageCreatedEvent))
    expect(domainEventDispatcherMock.dispatch).not.toHaveBeenCalledWith(expect.any(ImageAddedToStoryEvent))
    expect(domainEventDispatcherMock.dispatch).toHaveBeenCalledTimes(1)
  })

  it('should handle unknown errors without crashing', async ({ unitFixture }) => {
    // Arrange
    const userRepositoryMock = unitFixture.userRepositoryMock()
    const { transactionManagerMock } = unitFixture.transactionManagerFactory()
    const storyRepositoryMock = unitFixture.storyRepositoryMock()
    const imageRepositoryMock = unitFixture.imageRepositoryMock()

    userRepositoryMock.findById = vi.fn().mockRejectedValue(new Error('Database connection failed'))

    const options = createUseCaseOptions({
      loggedInUserId: unitFixture.userDTOMock().id,
      createStoryData: {
        name: 'Test Story',
        description: 'Test Description',
        visibility: VisibilityEnum.Public,
        image: null
      }
    })

    const useCase = new CreateStoryUseCase(
      userRepositoryMock,
      imageRepositoryMock,
      storyRepositoryMock,
      unitFixture.storyMapperMock({ dto: options.createStoryInput.createStoryData }),
      unitFixture.storyFactoryMock(),
      transactionManagerMock,
      domainEventDispatcherMock
    )

    // Act
    await expect(useCase.execute(options)).rejects.toThrow()

    // Assert
    expect(options.storyCreated).not.toHaveBeenCalled()
  })

  it('should clear domain events after dispatching through unit of work', async ({ unitFixture }) => {
    // Arrange
    const storyMock = unitFixture.storyMock()
    const storyRepositoryMock = unitFixture.storyRepositoryMock()
    const { transactionManagerMock } = unitFixture.transactionManagerFactory()
    const imageRepositoryMock = unitFixture.imageRepositoryMock()

    storyRepositoryMock.insert = vi.fn().mockResolvedValue(storyMock)

    const options = createUseCaseOptions({
      loggedInUserId: unitFixture.userDTOMock().id,
      createStoryData: {
        name: 'Test Story',
        description: 'Test Description',
        visibility: VisibilityEnum.Public,
        image: null
      }
    })

    const useCase = new CreateStoryUseCase(
      unitFixture.userRepositoryMock(),
      imageRepositoryMock,
      storyRepositoryMock,
      unitFixture.storyMapperMock({ dto: options.createStoryInput.createStoryData }),
      unitFixture.storyFactoryMock(),
      transactionManagerMock,
      domainEventDispatcherMock
    )

    // Act
    await useCase.execute(options)

    // Assert
    expect(storyMock.clearEvents).toHaveBeenCalled()
    expect(storyMock.domainEvents).toHaveLength(0)
  })

  it('should call userRepository.findById with correct UserId', async ({ unitFixture }) => {
    // Arrange
    const userRepositoryMock = unitFixture.userRepositoryMock()
    const { transactionManagerMock } = unitFixture.transactionManagerFactory()
    const storyRepositoryMock = unitFixture.storyRepositoryMock()
    const imageRepositoryMock = unitFixture.imageRepositoryMock()
    const userId = unitFixture.userDTOMock().id

    const options = createUseCaseOptions({
      loggedInUserId: userId,
      createStoryData: {
        name: 'Test Story',
        description: 'Test Description',
        visibility: VisibilityEnum.Public,
        image: null
      }
    })

    const useCase = new CreateStoryUseCase(
      userRepositoryMock,
      imageRepositoryMock,
      storyRepositoryMock,
      unitFixture.storyMapperMock({ dto: options.createStoryInput.createStoryData }),
      unitFixture.storyFactoryMock(),
      transactionManagerMock,
      domainEventDispatcherMock
    )

    // Act
    await useCase.execute(options)

    // Assert
    expect(userRepositoryMock.findById).toHaveBeenCalledWith(
      expect.objectContaining({
        value: userId
      })
    )
  })

  it('should execute transaction with correct dependency injections', async ({ unitFixture }) => {
    // Arrange
    const { transactionManagerMock, executeSpy } = unitFixture.transactionManagerFactory()
    const storyRepositoryMock = unitFixture.storyRepositoryMock()
    const imageRepositoryMock = unitFixture.imageRepositoryMock()
    const userRepositoryMock = unitFixture.userRepositoryMock()

    const options = createUseCaseOptions({
      loggedInUserId: unitFixture.userDTOMock().id,
      createStoryData: {
        name: 'Test Story',
        description: 'Test Description',
        visibility: VisibilityEnum.Public,
        image: null
      }
    })

    const useCase = new CreateStoryUseCase(
      userRepositoryMock,
      imageRepositoryMock,
      storyRepositoryMock,
      unitFixture.storyMapperMock({ dto: options.createStoryInput.createStoryData }),
      unitFixture.storyFactoryMock(),
      transactionManagerMock,
      domainEventDispatcherMock
    )

    // Act
    await useCase.execute(options)

    // Assert
    expect(executeSpy).toHaveBeenCalledWith(expect.any(Function), [storyRepositoryMock, imageRepositoryMock])
  })

  it('should handle transaction manager failure without crashing', async ({ unitFixture }) => {
    // Arrange
    const userRepositoryMock = unitFixture.userRepositoryMock()
    const { transactionManagerMock } = unitFixture.transactionManagerFactory()
    transactionManagerMock.execute = vi.fn().mockRejectedValue(new Error('Transaction failed'))
    const storyRepositoryMock = unitFixture.storyRepositoryMock()
    const imageRepositoryMock = unitFixture.imageRepositoryMock()

    const options = createUseCaseOptions({
      loggedInUserId: unitFixture.userDTOMock().id,
      createStoryData: {
        name: 'Test Story',
        description: 'Test Description',
        visibility: VisibilityEnum.Public,
        image: null
      }
    })

    const useCase = new CreateStoryUseCase(
      userRepositoryMock,
      imageRepositoryMock,
      storyRepositoryMock,
      unitFixture.storyMapperMock({ dto: options.createStoryInput.createStoryData }),
      unitFixture.storyFactoryMock(),
      transactionManagerMock,
      domainEventDispatcherMock
    )

    // Act & Assert
    unitFixture.expectErrorWraps(useCase.execute(options), Error, Error)
    expect(options.storyCreated).not.toHaveBeenCalled()
  })

  it('should handle event dispatcher failure', async ({ unitFixture }) => {
    // Arrange
    const userRepositoryMock = unitFixture.userRepositoryMock()
    const { transactionManagerMock } = unitFixture.transactionManagerFactory()
    const storyRepositoryMock = unitFixture.storyRepositoryMock()
    const imageRepositoryMock = unitFixture.imageRepositoryMock()
    domainEventDispatcherMock.dispatch = vi.fn().mockRejectedValue(new Error('Event dispatching failed'))

    const options = createUseCaseOptions({
      loggedInUserId: unitFixture.userDTOMock().id,
      createStoryData: {
        name: 'Test Story',
        description: 'Test Description',
        visibility: VisibilityEnum.Public,
        image: null
      }
    })

    const useCase = new CreateStoryUseCase(
      userRepositoryMock,
      imageRepositoryMock,
      storyRepositoryMock,
      unitFixture.storyMapperMock({ dto: options.createStoryInput.createStoryData }),
      unitFixture.storyFactoryMock(),
      transactionManagerMock,
      domainEventDispatcherMock
    )

    // Act & Assert
    unitFixture.expectErrorWraps(useCase.execute(options), Error, Error)
    expect(options.storyCreated).not.toHaveBeenCalled()
  })

  it('should dispatch events in correct order', async ({ unitFixture }) => {
    // Arrange
    const userRepositoryMock = unitFixture.userRepositoryMock()
    const { transactionManagerMock } = unitFixture.transactionManagerFactory()
    const storyRepositoryMock = unitFixture.storyRepositoryMock()
    const imageRepositoryMock = unitFixture.imageRepositoryMock()
    const storyMapperMock = unitFixture.storyMapperMock({
      dto: { name: 'Test Story', description: 'Test Description', visibility: VisibilityEnum.Public, image: null }
    })

    const options = createUseCaseOptions({
      loggedInUserId: unitFixture.userDTOMock().id,
      createStoryData: {
        name: 'Test Story',
        description: 'Test Description',
        visibility: VisibilityEnum.Public,
        image: {
          mimeType: 'image/jpeg',
          size: 1024,
          base64: 'test-base64'
        }
      }
    })

    const useCase = new CreateStoryUseCase(
      userRepositoryMock,
      imageRepositoryMock,
      storyRepositoryMock,
      storyMapperMock,
      unitFixture.storyFactoryMock(),
      transactionManagerMock,
      domainEventDispatcherMock
    )

    // Act
    await useCase.execute(options)

    // Assert
    expect(domainEventDispatcherMock.dispatch).toHaveBeenCalledTimes(3)
    expect(domainEventDispatcherMock.dispatch).toHaveBeenNthCalledWith(1, expect.any(StoryCreatedEvent))
    expect(domainEventDispatcherMock.dispatch).toHaveBeenNthCalledWith(2, expect.any(ImageAddedToStoryEvent))
    expect(domainEventDispatcherMock.dispatch).toHaveBeenNthCalledWith(3, expect.any(ImageCreatedEvent))
  })

  it('should rollback transaction when story repository fails', async ({ unitFixture }) => {
    // Arrange
    const userRepositoryMock = unitFixture.userRepositoryMock()
    const { transactionManagerMock, commitSpy, rollbackSpy } = unitFixture.transactionManagerFactory()
    const storyRepositoryMock = unitFixture.storyRepositoryMock()
    const imageRepositoryMock = unitFixture.imageRepositoryMock()
    const storyMapperMock = unitFixture.storyMapperMock()

    // Mock story repository to throw error
    storyRepositoryMock.insert.mockRejectedValue(new Error('Database error'))

    const options = createUseCaseOptions({
      loggedInUserId: unitFixture.userDTOMock().id,
      createStoryData: {
        name: 'Test Story',
        description: 'Test Description',
        visibility: VisibilityEnum.Public,
        image: null
      }
    })

    const useCase = new CreateStoryUseCase(
      userRepositoryMock,
      imageRepositoryMock,
      storyRepositoryMock,
      storyMapperMock,
      unitFixture.storyFactoryMock(),
      transactionManagerMock,
      domainEventDispatcherMock
    )

    // Act & Assert
    await unitFixture.expectErrorWraps(useCase.execute(options), Error, Error)

    expect(rollbackSpy).toHaveBeenCalled()
    expect(commitSpy).not.toHaveBeenCalled()

    expect(domainEventDispatcherMock.dispatch).not.toHaveBeenCalled()

    expect(options.storyCreated).not.toHaveBeenCalled()
  })
})
