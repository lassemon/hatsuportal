import { describe, it, expect, beforeEach, vi, Mocked, Mock } from 'vitest'
import { CreateStoryUseCaseWithValidation } from './CreateStoryUseCaseWithValidation'
import { UserRoleEnum, VisibilityEnum } from '@hatsuportal/common'
import { AuthenticationError, AuthorizationError, IDomainEventDispatcher } from '@hatsuportal/common-bounded-context'
import { CreateStoryInputDTO, ICreateStoryUseCaseOptions } from '@hatsuportal/post-management'
import { CreateStoryUseCase } from './CreateStoryUseCase'

const storyCreated = vi.fn()
const storyCreationFailed = vi.fn()
interface MockUseCaseOptions extends ICreateStoryUseCaseOptions {
  createStoryInput: CreateStoryInputDTO
  storyCreated: Mock
  storyCreationFailed: Mock
}

function createUseCaseOptions(createStoryInput: CreateStoryInputDTO): MockUseCaseOptions {
  return {
    createStoryInput,
    storyCreated,
    storyCreationFailed
  }
}

describe('CreateStoryUseCase', () => {
  let domainEventDispatcherMock: Mocked<IDomainEventDispatcher>

  beforeEach(({ unitFixture }) => {
    domainEventDispatcherMock = unitFixture.domainEventDispatcherMock()
    storyCreated.mockReset()
    storyCreationFailed.mockReset()
  })

  it('should successfully execute use case when all validations pass', async ({ unitFixture }) => {
    // Arrange
    const userRepositoryMock = unitFixture.userRepositoryMock()
    const { transactionManagerMock } = unitFixture.transactionManagerFactory()
    const storyRepositoryMock = unitFixture.storyRepositoryMock()
    const imageRepositoryMock = unitFixture.imageRepositoryMock()
    const authorizationServiceMock = unitFixture.authorizationServiceMock()
    const storyFactoryMock = unitFixture.storyFactoryMock()

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
      storyFactoryMock,
      transactionManagerMock,
      domainEventDispatcherMock
    )
    const useCaseWithValidation = new CreateStoryUseCaseWithValidation(
      useCase,
      userRepositoryMock,
      authorizationServiceMock,
      storyFactoryMock
    )

    // Act
    await useCaseWithValidation.execute(options)

    // Assert
    expect(options.storyCreated).toHaveBeenCalledWith(options.createStoryInput.createStoryData)
    expect(transactionManagerMock.execute).toHaveBeenCalled()
    expect(storyRepositoryMock.insert).toHaveBeenCalled()
  })

  it('should throw AuthenticationError if loggedInUserId does not exist', async ({ unitFixture }) => {
    // Arrange
    const nonExistentUserId = 'non-existent-user-id-a2f0-f95ccab82d92'
    const userRepositoryMock = unitFixture.userRepositoryMock()
    const { transactionManagerMock } = unitFixture.transactionManagerFactory()
    const storyRepositoryMock = unitFixture.storyRepositoryMock()
    const imageRepositoryMock = unitFixture.imageRepositoryMock()
    const storyMapperMock = unitFixture.storyMapperMock()
    const authorizationServiceMock = unitFixture.authorizationServiceMock()
    const storyFactoryMock = unitFixture.storyFactoryMock()

    userRepositoryMock.findById = vi.fn().mockResolvedValue(null)

    const options = createUseCaseOptions({
      loggedInUserId: nonExistentUserId,
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
      storyFactoryMock,
      transactionManagerMock,
      domainEventDispatcherMock
    )
    const useCaseWithValidation = new CreateStoryUseCaseWithValidation(
      useCase,
      userRepositoryMock,
      authorizationServiceMock,
      storyFactoryMock
    )

    // Act & Assert
    await expect(useCaseWithValidation.execute(options)).rejects.toThrow(AuthenticationError)
    expect(userRepositoryMock.findById).toHaveBeenCalledWith(expect.any(Object))
    expect(options.storyCreated).not.toHaveBeenCalled()
  })

  it('should throw AuthenticationError if authorization fails', async ({ unitFixture }) => {
    // Arrange
    const nonAdminUser = {
      ...unitFixture.userDTOMock(),
      isCreator: () => false
    }
    const userRepositoryMock = unitFixture.userRepositoryMock()
    const { transactionManagerMock } = unitFixture.transactionManagerFactory()
    const storyRepositoryMock = unitFixture.storyRepositoryMock()
    const imageRepositoryMock = unitFixture.imageRepositoryMock()
    const storyMapperMock = unitFixture.storyMapperMock()
    const authorizationServiceMock = unitFixture.authorizationServiceMock()
    authorizationServiceMock.canCreateStory = vi.fn().mockReturnValue({ isAuthorized: false })
    const storyFactoryMock = unitFixture.storyFactoryMock()

    userRepositoryMock.findById = vi.fn().mockResolvedValue(nonAdminUser)

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
      storyFactoryMock,
      transactionManagerMock,
      domainEventDispatcherMock
    )
    const useCaseWithValidation = new CreateStoryUseCaseWithValidation(
      useCase,
      userRepositoryMock,
      authorizationServiceMock,
      storyFactoryMock
    )

    // Act & Assert
    await expect(useCaseWithValidation.execute(options)).rejects.toThrow(AuthorizationError)
    expect(userRepositoryMock.findById).toHaveBeenCalledWith(expect.any(Object))
    expect(options.storyCreated).not.toHaveBeenCalled()
  })

  it('should throw AuthenticationError if user is not found', async ({ unitFixture }) => {
    // Arrange
    const userRepositoryMock = unitFixture.userRepositoryMock()
    const { transactionManagerMock } = unitFixture.transactionManagerFactory()
    const storyRepositoryMock = unitFixture.storyRepositoryMock()
    const imageRepositoryMock = unitFixture.imageRepositoryMock()
    const storyMapperMock = unitFixture.storyMapperMock()
    const authorizationServiceMock = unitFixture.authorizationServiceMock()
    const storyFactoryMock = unitFixture.storyFactoryMock()

    userRepositoryMock.findById = vi.fn().mockResolvedValue(null)

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
      storyFactoryMock,
      transactionManagerMock,
      domainEventDispatcherMock
    )
    const useCaseWithValidation = new CreateStoryUseCaseWithValidation(
      useCase,
      userRepositoryMock,
      authorizationServiceMock,
      storyFactoryMock
    )

    // Act & Assert
    await expect(useCaseWithValidation.execute(options)).rejects.toThrow(AuthenticationError)
    expect(userRepositoryMock.findById).toHaveBeenCalledWith(expect.any(Object))
    expect(options.storyCreated).not.toHaveBeenCalled()
  })

  it('should handle user with multiple roles including creator', async ({ unitFixture }) => {
    // Test user with multiple roles
    const userRepositoryMock = unitFixture.userRepositoryMock()
    const { transactionManagerMock } = unitFixture.transactionManagerFactory()
    const storyRepositoryMock = unitFixture.storyRepositoryMock()
    const imageRepositoryMock = unitFixture.imageRepositoryMock()
    const storyMapperMock = unitFixture.storyMapperMock()
    const authorizationServiceMock = unitFixture.authorizationServiceMock()
    const storyFactoryMock = unitFixture.storyFactoryMock()

    userRepositoryMock.findById = vi
      .fn()
      .mockResolvedValue(unitFixture.userMock({ roles: [UserRoleEnum.Creator, UserRoleEnum.Viewer, UserRoleEnum.Admin] }))

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
      storyFactoryMock,
      transactionManagerMock,
      domainEventDispatcherMock
    )
    const useCaseWithValidation = new CreateStoryUseCaseWithValidation(
      useCase,
      userRepositoryMock,
      authorizationServiceMock,
      storyFactoryMock
    )

    // Act
    await useCaseWithValidation.execute(options)

    // Assert
    expect(options.storyCreated).toHaveBeenCalled()
    expect(options.storyCreationFailed).not.toHaveBeenCalled()
  })
})
