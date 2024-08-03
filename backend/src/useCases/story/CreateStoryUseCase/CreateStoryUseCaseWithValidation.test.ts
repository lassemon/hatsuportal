import { describe, it, expect, beforeEach, vi, Mocked } from 'vitest'
import { CreateStoryUseCaseWithValidation } from './CreateStoryUseCaseWithValidation'
import { VisibilityEnum } from '@hatsuportal/common'
import { AuthenticationError, IDomainEventDispatcher } from '@hatsuportal/common-bounded-context'
import { ICreateStoryUseCaseOptions } from '@hatsuportal/post-management'
import { CreateStoryUseCase } from './CreateStoryUseCase'

describe('CreateStoryUseCase', () => {
  let domainEventDispatcherMock: Mocked<IDomainEventDispatcher>

  beforeEach(({ unitFixture }) => {
    domainEventDispatcherMock = unitFixture.domainEventDispatcherMock()
  })

  it('should throw AuthenticationError if loggedInUserId does not exist', async ({ unitFixture }) => {
    // Arrange
    const nonExistentUserId = 'non-existent-user-id-a2f0-f95ccab82d92'
    const userRepositoryMock = unitFixture.userRepositoryMock()
    const transactionManagerMock = unitFixture.transactionManagerMock()
    const storyRepositoryMock = unitFixture.storyRepositoryMock()
    const imageRepositoryMock = unitFixture.imageRepositoryMock()
    const storyMapperMock = unitFixture.storyMapperMock()

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
    const useCase = new CreateStoryUseCase(
      userRepositoryMock,
      imageRepositoryMock,
      storyRepositoryMock,
      storyMapperMock,
      transactionManagerMock,
      domainEventDispatcherMock
    )
    const useCaseWithValidation = new CreateStoryUseCaseWithValidation(useCase, userRepositoryMock)

    // Act & Assert
    await expect(useCaseWithValidation.execute(options)).rejects.toThrow(AuthenticationError)
    expect(userRepositoryMock.findById).toHaveBeenCalledWith(expect.any(Object))
  })

  it('should throw AuthenticationError if user is not a creator', async ({ unitFixture }) => {
    // Arrange
    const nonAdminUser = {
      ...unitFixture.userDTOMock(),
      isCreator: () => false
    }
    const userRepositoryMock = unitFixture.userRepositoryMock()
    const transactionManagerMock = unitFixture.transactionManagerMock()
    const storyRepositoryMock = unitFixture.storyRepositoryMock()
    const imageRepositoryMock = unitFixture.imageRepositoryMock()
    const storyMapperMock = unitFixture.storyMapperMock()

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
    const useCase = new CreateStoryUseCase(
      userRepositoryMock,
      imageRepositoryMock,
      storyRepositoryMock,
      storyMapperMock,
      transactionManagerMock,
      domainEventDispatcherMock
    )
    const useCaseWithValidation = new CreateStoryUseCaseWithValidation(useCase, userRepositoryMock)

    // Act & Assert
    await expect(useCaseWithValidation.execute(options)).rejects.toThrow(AuthenticationError)
    expect(userRepositoryMock.findById).toHaveBeenCalledWith(expect.any(Object))
  })

  it('should throw AuthenticationError if user is not found', async ({ unitFixture }) => {
    // Arrange
    const userRepositoryMock = unitFixture.userRepositoryMock()
    const transactionManagerMock = unitFixture.transactionManagerMock()
    const storyRepositoryMock = unitFixture.storyRepositoryMock()
    const imageRepositoryMock = unitFixture.imageRepositoryMock()
    const storyMapperMock = unitFixture.storyMapperMock()

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
    const useCase = new CreateStoryUseCase(
      userRepositoryMock,
      imageRepositoryMock,
      storyRepositoryMock,
      storyMapperMock,
      transactionManagerMock,
      domainEventDispatcherMock
    )
    const useCaseWithValidation = new CreateStoryUseCaseWithValidation(useCase, userRepositoryMock)

    // Act & Assert
    await expect(useCaseWithValidation.execute(options)).rejects.toThrow(AuthenticationError)
    expect(userRepositoryMock.findById).toHaveBeenCalledWith(expect.any(Object))
  })
})
