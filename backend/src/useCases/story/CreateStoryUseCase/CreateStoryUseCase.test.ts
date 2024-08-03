import { describe, it, expect, beforeEach, vi } from 'vitest'
import { CreateStoryUseCase } from './CreateStoryUseCase'
import {
  ICreateStoryUseCaseOptions,
  AuthenticationError,
  CreateStoryImageInputDTO,
  IDomainEventDispatcher,
  ApplicationError
} from '@hatsuportal/application'
import {
  StoryCreatedEvent,
  ImageAddedToStoryEvent,
  ITransactionalUnitOfWork,
  Story,
  storyRepositoryMock,
  imageRepositoryMock
} from '@hatsuportal/domain'
import { VisibilityEnum } from '@hatsuportal/common'

describe('CreateStoryUseCase', () => {
  let mockUnitOfWork: ITransactionalUnitOfWork<Story | null>
  let domainEventDispatcherMock: IDomainEventDispatcher

  beforeEach(({ unitFixture }) => {
    domainEventDispatcherMock = unitFixture.domainEventDispatcherMock()
    mockUnitOfWork = unitFixture.unitOfWorkMock(
      unitFixture.connectionMock(),
      storyRepositoryMock(),
      imageRepositoryMock(),
      domainEventDispatcherMock
    )
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
    const useCase = new CreateStoryUseCase(
      mockUnitOfWork,
      unitFixture.userRepositoryMock(),
      // force mapper to return the createStoryData for testing purposes
      // if mapper is called, everything else in the use case succeeded without errors
      unitFixture.storyMapperMock({ dto: options.createStoryInput.createStoryData })
    )

    // Act
    await useCase.execute(options)

    // Assert
    expect(mockUnitOfWork.execute).toHaveBeenCalled()
    expect(storyCreated).toHaveBeenCalledWith(options.createStoryInput.createStoryData)
  })

  it('should create a story with image successfully', async ({ unitFixture }) => {
    // Arrange
    const storyCreated = vi.fn()
    const imageInput: CreateStoryImageInputDTO = {
      visibility: VisibilityEnum.Public,
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
    const useCase = new CreateStoryUseCase(
      mockUnitOfWork,
      unitFixture.userRepositoryMock(),
      // force mapper to return the createStoryData for testing purposes
      // if mapper is called, everything else in the use case succeeded without errors
      unitFixture.storyMapperMock({ dto: options.createStoryInput.createStoryData })
    )

    // Act
    await useCase.execute(options)

    // Assert
    expect(mockUnitOfWork.execute).toHaveBeenCalled()
    expect(storyCreated).toHaveBeenCalledWith(options.createStoryInput.createStoryData)
  })

  it('should throw AuthenticationError if loggedInUserId does not exist', async ({ unitFixture }) => {
    // Arrange
    const nonExistentUserId = 'non-existent-user-id-a2f0-f95ccab82d92'
    const userRepositoryMock = unitFixture.userRepositoryMock()
    userRepositoryMock.findById = vi.fn().mockResolvedValue(null)

    const options: ICreateStoryUseCaseOptions = {
      createStoryInput: {
        loggedInUserId: nonExistentUserId,
        createStoryData: {
          name: 'Test Story',
          description: 'Test Description',
          visibility: VisibilityEnum.Public,
          image: null
        }
      },
      storyCreated: vi.fn()
    }
    const useCase = new CreateStoryUseCase(mockUnitOfWork, userRepositoryMock, unitFixture.storyMapperMock())

    // Act & Assert
    await expect(useCase.execute(options)).rejects.toThrow(AuthenticationError)
  })

  it('should throw AuthenticationError if user is not a creator', async ({ unitFixture }) => {
    // Arrange
    const nonAdminUser = {
      ...unitFixture.userDTOMock(),
      isCreator: () => false
    }
    const userRepositoryMock = unitFixture.userRepositoryMock()
    userRepositoryMock.findById = vi.fn().mockResolvedValue(nonAdminUser)

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
    const useCase = new CreateStoryUseCase(mockUnitOfWork, userRepositoryMock, unitFixture.storyMapperMock())
    // Act & Assert
    await expect(useCase.execute(options)).rejects.toThrow(AuthenticationError)
  })

  it('should throw AuthenticationError if user is not found', async ({ unitFixture }) => {
    // Arrange
    const userRepositoryMock = unitFixture.userRepositoryMock()
    userRepositoryMock.findById = vi.fn().mockResolvedValue(null)

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
    const useCase = new CreateStoryUseCase(mockUnitOfWork, userRepositoryMock, unitFixture.storyMapperMock())

    // Act & Assert
    await expect(useCase.execute(options)).rejects.toThrow(AuthenticationError)
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
    const useCase = new CreateStoryUseCase(mockUnitOfWork, unitFixture.userRepositoryMock(), unitFixture.storyMapperMock())

    // Act
    await useCase.execute(options)

    // Assert
    expect(domainEventDispatcherMock.dispatch).toHaveBeenCalledWith(expect.any(StoryCreatedEvent))
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
            visibility: VisibilityEnum.Public,
            mimeType: 'image/jpeg',
            size: 1024,
            base64: 'test-base64'
          }
        }
      },
      storyCreated
    }
    const useCase = new CreateStoryUseCase(mockUnitOfWork, unitFixture.userRepositoryMock(), unitFixture.storyMapperMock())

    // Act
    await useCase.execute(options)

    // Assert
    expect(domainEventDispatcherMock.dispatch).toHaveBeenCalledWith(expect.any(ImageAddedToStoryEvent))
  })

  it('should wrap unknown errors in ApplicationError', async ({ unitFixture }) => {
    // Arrange
    const unknownError = new Error('Unknown error')
    mockUnitOfWork.execute = vi.fn().mockRejectedValue(unknownError)

    const useCase = new CreateStoryUseCase(mockUnitOfWork, unitFixture.userRepositoryMock(), unitFixture.storyMapperMock())

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

    // We can verify the events are cleared by checking the unit of work's aggregate
    let capturedStory: Story | null = null
    mockUnitOfWork.execute = vi.fn().mockImplementation(async function (this: ITransactionalUnitOfWork<Story>) {
      capturedStory = this.aggregate
      await this.beginTransaction()
      await this.commit()
    })

    const useCase = new CreateStoryUseCase(mockUnitOfWork, unitFixture.userRepositoryMock(), unitFixture.storyMapperMock())

    // Act
    await useCase.execute(options)

    // Assert
    expect(capturedStory).not.toBeNull()
    expect(capturedStory!.domainEvents).toHaveLength(0)
  })

  it('should call storyCreated callback with correct DTO', async ({ unitFixture }) => {
    // Arrange
    const storyCreated = vi.fn()
    const expectedDTO = unitFixture.storyDTOMock()
    const storyMapperMock = unitFixture.storyMapperMock()
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

    const useCase = new CreateStoryUseCase(mockUnitOfWork, unitFixture.userRepositoryMock(), storyMapperMock)

    // Act
    await useCase.execute(options)

    // Assert
    expect(storyCreated).toHaveBeenCalledWith(expectedDTO)
    expect(storyMapperMock.toDTO).toHaveBeenCalled()
  })

  it('should validate image properties when creating story with image', async ({ unitFixture }) => {
    // Arrange
    const invalidImageInput: CreateStoryImageInputDTO = {
      visibility: VisibilityEnum.Public,
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

    const useCase = new CreateStoryUseCase(mockUnitOfWork, unitFixture.userRepositoryMock(), unitFixture.storyMapperMock())

    // Act & Assert
    await expect(useCase.execute(options)).rejects.toThrow()
  })
})
