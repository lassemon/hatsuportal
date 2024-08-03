import { describe, it, expect, beforeEach, vi, Mocked } from 'vitest'
import { CreateStoryUseCase } from './CreateStoryUseCase'
import { IDomainEventDispatcher, ApplicationError } from '@hatsuportal/common-bounded-context'
import {
  StoryCreatedEvent,
  ImageAddedToStoryEvent,
  ICreateStoryUseCaseOptions,
  CreateStoryImageInputDTO
} from '@hatsuportal/post-management'
import { VisibilityEnum } from '@hatsuportal/common'

describe('CreateStoryUseCase', () => {
  let domainEventDispatcherMock: Mocked<IDomainEventDispatcher>

  beforeEach(({ unitFixture }) => {
    domainEventDispatcherMock = unitFixture.domainEventDispatcherMock()
  })

  it('should create a story successfully', async ({ unitFixture }) => {
    // Arrange
    const storyCreated = vi.fn()
    const options: ICreateStoryUseCaseOptions = {
      createStoryInput: {
        loggedInUserId: unitFixture.userDTOMock().id,
        createStoryData: {
          name: 'Test Story',
          description: 'Test Description',
          visibility: VisibilityEnum.Public,
          image: null
        }
      },
      storyCreated
    }
    const transactionManagerMock = unitFixture.transactionManagerMock()
    const storyRepositoryMock = unitFixture.storyRepositoryMock()
    const useCase = new CreateStoryUseCase(
      unitFixture.userRepositoryMock(),
      unitFixture.imageRepositoryMock(),
      storyRepositoryMock,
      unitFixture.storyMapperMock({ dto: options.createStoryInput.createStoryData }),
      transactionManagerMock,
      domainEventDispatcherMock
    )

    // Act
    await useCase.execute(options)

    // Assert
    expect(storyCreated).toHaveBeenCalledWith(options.createStoryInput.createStoryData)
    expect(transactionManagerMock.execute).toHaveBeenCalled()
    expect(storyRepositoryMock.insert).toHaveBeenCalled()
    expect(domainEventDispatcherMock.dispatch).toHaveBeenCalledWith(expect.any(StoryCreatedEvent))
  })

  it('should create a story with image successfully', async ({ unitFixture }) => {
    // Arrange
    const storyCreated = vi.fn()
    const imageInput: CreateStoryImageInputDTO = {
      mimeType: 'image/jpeg',
      size: 1024,
      base64: 'test-base64'
    }

    const options: ICreateStoryUseCaseOptions = {
      createStoryInput: {
        loggedInUserId: unitFixture.userDTOMock().id,
        createStoryData: {
          name: 'Test Story',
          description: 'Test Description',
          visibility: VisibilityEnum.Public,
          image: imageInput
        }
      },
      storyCreated
    }
    const transactionManagerMock = unitFixture.transactionManagerMock()
    const storyRepositoryMock = unitFixture.storyRepositoryMock()
    const useCase = new CreateStoryUseCase(
      unitFixture.userRepositoryMock(),
      unitFixture.imageRepositoryMock(),
      storyRepositoryMock,
      unitFixture.storyMapperMock({ dto: options.createStoryInput.createStoryData }),
      transactionManagerMock,
      domainEventDispatcherMock
    )

    // Act
    await useCase.execute(options)

    // Assert
    expect(storyCreated).toHaveBeenCalledWith(options.createStoryInput.createStoryData)
    expect(transactionManagerMock.execute).toHaveBeenCalled()
    expect(storyRepositoryMock.insert).toHaveBeenCalled()
    expect(domainEventDispatcherMock.dispatch).toHaveBeenCalledWith(expect.any(StoryCreatedEvent))
    expect(domainEventDispatcherMock.dispatch).toHaveBeenCalledWith(expect.any(ImageAddedToStoryEvent))
  })

  it('should dispatch StoryCreatedEvent', async ({ unitFixture }) => {
    // Arrange
    const storyCreated = vi.fn()
    const options: ICreateStoryUseCaseOptions = {
      createStoryInput: {
        loggedInUserId: unitFixture.userDTOMock().id,
        createStoryData: {
          name: 'Test Story',
          description: 'Test Description',
          visibility: VisibilityEnum.Public,
          image: null
        }
      },
      storyCreated
    }
    const transactionManagerMock = unitFixture.transactionManagerMock()
    const storyRepositoryMock = unitFixture.storyRepositoryMock()
    storyRepositoryMock.insert = vi.fn().mockResolvedValue(unitFixture.storyMockWithoutImage())
    const imageRepositoryMock = unitFixture.imageRepositoryMock()
    const storyMapperMock = unitFixture.storyMapperMock()

    const useCase = new CreateStoryUseCase(
      unitFixture.userRepositoryMock(),
      imageRepositoryMock,
      storyRepositoryMock,
      storyMapperMock,
      transactionManagerMock,
      domainEventDispatcherMock
    )

    // Act
    await useCase.execute(options)

    // Assert
    expect(domainEventDispatcherMock.dispatch).toHaveBeenCalledWith(expect.any(StoryCreatedEvent))
    expect(domainEventDispatcherMock.dispatch).toHaveBeenCalledTimes(1)
  })

  it('should dispatch ImageAddedToStoryEvent when image is provided', async ({ unitFixture }) => {
    // Arrange
    const storyCreated = vi.fn()
    const options: ICreateStoryUseCaseOptions = {
      createStoryInput: {
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
      },
      storyCreated
    }
    const transactionManagerMock = unitFixture.transactionManagerMock()
    const storyRepositoryMock = unitFixture.storyRepositoryMock()
    const imageRepositoryMock = unitFixture.imageRepositoryMock()
    const storyMapperMock = unitFixture.storyMapperMock()

    const useCase = new CreateStoryUseCase(
      unitFixture.userRepositoryMock(),
      imageRepositoryMock,
      storyRepositoryMock,
      storyMapperMock,
      transactionManagerMock,
      domainEventDispatcherMock
    )

    // Act
    await useCase.execute(options)

    // Assert
    expect(domainEventDispatcherMock.dispatch).toHaveBeenCalledWith(expect.any(ImageAddedToStoryEvent))
    expect(domainEventDispatcherMock.dispatch).toHaveBeenCalledWith(expect.any(StoryCreatedEvent))
    expect(domainEventDispatcherMock.dispatch).toHaveBeenCalledTimes(2)
  })

  it('should wrap unknown errors in ApplicationError', async ({ unitFixture }) => {
    // Arrange
    const userRepositoryMock = unitFixture.userRepositoryMock()
    const transactionManagerMock = unitFixture.transactionManagerMock()
    const storyRepositoryMock = unitFixture.storyRepositoryMock()
    const imageRepositoryMock = unitFixture.imageRepositoryMock()
    const storyMapperMock = unitFixture.storyMapperMock()

    userRepositoryMock.findById = vi.fn().mockRejectedValue(new Error('Database connection failed'))

    const useCase = new CreateStoryUseCase(
      userRepositoryMock,
      imageRepositoryMock,
      storyRepositoryMock,
      storyMapperMock,
      transactionManagerMock,
      domainEventDispatcherMock
    )

    const options: ICreateStoryUseCaseOptions = {
      createStoryInput: {
        loggedInUserId: unitFixture.userDTOMock().id,
        createStoryData: {
          name: 'Test Story',
          description: 'Test Description',
          visibility: VisibilityEnum.Public,
          image: null
        }
      },
      storyCreated: vi.fn()
    }

    // Act & Assert
    await expect(useCase.execute(options)).rejects.toThrow(ApplicationError)
  })

  it('should clear domain events after dispatching through unit of work', async ({ unitFixture }) => {
    // Arrange
    const storyMock = unitFixture.storyMock()
    const storyRepositoryMock = unitFixture.storyRepositoryMock()
    const transactionManagerMock = unitFixture.transactionManagerMock()
    const imageRepositoryMock = unitFixture.imageRepositoryMock()
    const storyMapperMock = unitFixture.storyMapperMock()

    storyRepositoryMock.insert = vi.fn().mockResolvedValue(storyMock)

    const options: ICreateStoryUseCaseOptions = {
      createStoryInput: {
        loggedInUserId: unitFixture.userDTOMock().id,
        createStoryData: {
          name: 'Test Story',
          description: 'Test Description',
          visibility: VisibilityEnum.Public,
          image: null
        }
      },
      storyCreated: vi.fn()
    }

    const useCase = new CreateStoryUseCase(
      unitFixture.userRepositoryMock(),
      imageRepositoryMock,
      storyRepositoryMock,
      storyMapperMock,
      transactionManagerMock,
      domainEventDispatcherMock
    )

    // Act
    await useCase.execute(options)

    // Assert
    expect(storyMock.clearEvents).toHaveBeenCalled()
    expect(storyMock.domainEvents).toHaveLength(0)
  })

  it('should call storyCreated callback with correct DTO', async ({ unitFixture }) => {
    // Arrange
    const storyCreated = vi.fn()
    const expectedDTO = unitFixture.storyDTOMock()
    const storyMapperMock = unitFixture.storyMapperMock()
    const transactionManagerMock = unitFixture.transactionManagerMock()
    const storyRepositoryMock = unitFixture.storyRepositoryMock()
    const imageRepositoryMock = unitFixture.imageRepositoryMock()

    storyMapperMock.toDTO = vi.fn().mockReturnValue(expectedDTO)

    const options: ICreateStoryUseCaseOptions = {
      createStoryInput: {
        loggedInUserId: unitFixture.userDTOMock().id,
        createStoryData: {
          name: 'Test Story',
          description: 'Test Description',
          visibility: VisibilityEnum.Public,
          image: null
        }
      },
      storyCreated
    }

    const useCase = new CreateStoryUseCase(
      unitFixture.userRepositoryMock(),
      imageRepositoryMock,
      storyRepositoryMock,
      storyMapperMock,
      transactionManagerMock,
      domainEventDispatcherMock
    )

    // Act
    await useCase.execute(options)

    // Assert
    expect(storyCreated).toHaveBeenCalledWith(expectedDTO)
    expect(storyMapperMock.toDTO).toHaveBeenCalled()
  })

  it('should validate image properties when creating story with image', async ({ unitFixture }) => {
    // Arrange
    const invalidImageInput: CreateStoryImageInputDTO = {
      mimeType: '', // invalid mime type
      size: -1, // invalid size
      base64: '' // invalid base64
    }

    const options: ICreateStoryUseCaseOptions = {
      createStoryInput: {
        loggedInUserId: unitFixture.userDTOMock().id,
        createStoryData: {
          name: 'Test Story',
          description: 'Test Description',
          visibility: VisibilityEnum.Public,
          image: invalidImageInput
        }
      },
      storyCreated: vi.fn()
    }

    const transactionManagerMock = unitFixture.transactionManagerMock()
    const storyRepositoryMock = unitFixture.storyRepositoryMock()
    const imageRepositoryMock = unitFixture.imageRepositoryMock()
    const storyMapperMock = unitFixture.storyMapperMock()

    const useCase = new CreateStoryUseCase(
      unitFixture.userRepositoryMock(),
      imageRepositoryMock,
      storyRepositoryMock,
      storyMapperMock,
      transactionManagerMock,
      domainEventDispatcherMock
    )

    // Act & Assert
    await expect(useCase.execute(options)).rejects.toThrow()
  })

  it('should call userRepository.findById with correct UserId', async ({ unitFixture }) => {
    // Arrange
    const userRepositoryMock = unitFixture.userRepositoryMock()
    const transactionManagerMock = unitFixture.transactionManagerMock()
    const storyRepositoryMock = unitFixture.storyRepositoryMock()
    const imageRepositoryMock = unitFixture.imageRepositoryMock()
    const storyMapperMock = unitFixture.storyMapperMock()
    const userId = unitFixture.userDTOMock().id

    const options: ICreateStoryUseCaseOptions = {
      createStoryInput: {
        loggedInUserId: userId,
        createStoryData: {
          name: 'Test Story',
          description: 'Test Description',
          visibility: VisibilityEnum.Public,
          image: null
        }
      },
      storyCreated: vi.fn()
    }

    const useCase = new CreateStoryUseCase(
      userRepositoryMock,
      imageRepositoryMock,
      storyRepositoryMock,
      storyMapperMock,
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

  it('should execute transaction with correct repositories', async ({ unitFixture }) => {
    // Arrange
    const transactionManagerMock = unitFixture.transactionManagerMock()
    const storyRepositoryMock = unitFixture.storyRepositoryMock()
    const imageRepositoryMock = unitFixture.imageRepositoryMock()
    const userRepositoryMock = unitFixture.userRepositoryMock()
    const storyMapperMock = unitFixture.storyMapperMock()

    const options: ICreateStoryUseCaseOptions = {
      createStoryInput: {
        loggedInUserId: unitFixture.userDTOMock().id,
        createStoryData: {
          name: 'Test Story',
          description: 'Test Description',
          visibility: VisibilityEnum.Public,
          image: null
        }
      },
      storyCreated: vi.fn()
    }

    const useCase = new CreateStoryUseCase(
      userRepositoryMock,
      imageRepositoryMock,
      storyRepositoryMock,
      storyMapperMock,
      transactionManagerMock,
      domainEventDispatcherMock
    )

    // Act
    await useCase.execute(options)

    // Assert
    expect(transactionManagerMock.execute).toHaveBeenCalledWith(expect.any(Function), [storyRepositoryMock, imageRepositoryMock])
  })
})
