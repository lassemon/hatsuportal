import {
  IStoryApplicationMapper,
  IStoryFactory,
  IStoryRepository,
  Story,
  StoryApplicationMapper,
  StoryFactory,
  StoryProps
} from '@hatsuportal/post-management'
import { IUserFactory, IUserRepository, User } from '@hatsuportal/user-management'
import { expect, Mocked, vi } from 'vitest'
import Connection from '../infrastructure/dataAccess/database/connection'
import { BASE64_PREFIX, EntityTypeEnum, ImageStateEnum, unixtimeNow, UserRoleEnum, VisibilityEnum } from '@hatsuportal/common'
import {
  IDomainEvent,
  IDomainEventDispatcher,
  IImageStorageService,
  Image,
  ITransactionManager,
  IImageRepository,
  IImageProcessingService,
  EntityFactoryResult,
  ImageDTO
} from '@hatsuportal/common-bounded-context'
import { TransactionManager } from '../infrastructure/dataAccess/database/TransactionManager'
import { IDatabaseConnectionProvider } from '../infrastructure/dataAccess/database/IDatabaseConnectionProvider'
import { UserProps } from '@hatsuportal/user-management/src/domain/entities/User'
import { Knex } from 'knex'
import { IAuthorizationService } from '../application/services/IAuthorizationService'
import { Authorization } from '../infrastructure/auth/Authorization'
import {
  CreateImageRequest,
  CreateStoryRequest,
  CreateUserRequest,
  ImageResponse,
  SearchStoriesRequest,
  UpdateImageRequest,
  UpdateStoryRequest,
  UpdateUserRequest
} from '@hatsuportal/contracts'
import { base64Payload } from './support/image/base64Payload'

const createdAt = unixtimeNow() - 3000
const updatedAt = createdAt + 1500

export class TestError extends Error {
  constructor(message: string) {
    super(message)
  }
}

export const imageDTOMock = (): ImageDTO => {
  return {
    ...{
      id: 'test1b19-enti-ty92-a2f0-f95cc2metadata',
      fileName: 'filename.png',
      mimeType: 'image/png',
      size: 1537565,
      ownerEntityId: 'test1b19-81db-4792-a2f0-f95ccab82d92',
      ownerEntityType: EntityTypeEnum.Story,
      createdById: 'test1b19-81db-4792-a2f0-f95ccab82d92',
      createdByName: 'testUserName',
      base64: 'data:image/png;base64,iVBORw0KGgo',
      createdAt,
      updatedAt
    }
  }
}

export const createImageRequest = (): CreateImageRequest => {
  return {
    ...{
      id: 'not ok id', // should not be able to give this
      fileName: 'filename.png',
      mimeType: 'image/png',
      size: 1537565,
      ownerEntityId: '123',
      ownerEntityType: EntityTypeEnum.Story,
      base64: 'asdasdasd',
      createdById: '345', // should not be able to give this
      createdByName: 'foobar', // should not be able to give this
      createdAt: unixtimeNow({ substract: { minutes: 1 } }), // should not be able to give this
      updatedAt: unixtimeNow({ add: { minutes: 1 } }) // should not be able to give this
    }
  }
}

export const imageResponse = (): ImageResponse => {
  return {
    ...{
      ...imageDTOMock()
    }
  }
}

export const updateImageRequest = (): UpdateImageRequest => {
  return {
    ...{
      id: imageDTOMock().id,
      fileName: 'filename.png',
      mimeType: 'image/png',
      size: 1577165,
      ownerEntityId: '123',
      ownerEntityType: EntityTypeEnum.Blogpost,
      base64: 'loremipsum',
      createdById: 'test1b19-user-4792-a2f0-f95ccab82d92', // should not be able to change this
      createdByName: 'foobar', // should not be able to change this
      createdAt: unixtimeNow({ substract: { minutes: 1 } }), // should not be able to change this
      updatedAt: unixtimeNow({ add: { minutes: 1 } }) // should not be able to change this
    }
  }
}

export const userDTOMock = () => {
  return {
    ...{
      id: 'test1b19-user-4792-a2f0-f95ccab82d92',
      name: 'username',
      email: 'email@test.com',
      roles: [UserRoleEnum.Admin],
      active: true,
      createdAt,
      updatedAt
    }
  }
}

export const storyDTOMock = () => {
  return {
    ...{
      id: 'test1b19-story-4792-a2f0-f95ccab82d92',
      visibility: VisibilityEnum.Public,
      createdById: userDTOMock().id,
      createdByName: 'testUserName',
      createdAt,
      updatedAt,
      image: imageDTOMock(),
      name: 'test story',
      description: 'A test story.',
      imageLoadState: ImageStateEnum.Available,
      imageLoadError: null
    }
  }
}

export const searchStoriesRequest = (): SearchStoriesRequest => {
  return {
    storiesPerPage: 50,
    pageNumber: 1,
    onlyMyStories: false,
    order: 'asc',
    orderBy: 'visibility',
    search: 'search string',
    visibility: ['logged_in', 'private'],
    hasImage: false
  }
}

export const createStoryRequest = (): CreateStoryRequest => {
  return {
    ...{
      id: 'not ok id', // should not be able to give this
      visibility: VisibilityEnum.Public,
      name: storyDTOMock().name,
      description: storyDTOMock().description,
      image: imageDTOMock(),
      createdById: '123', // should not be able to give this
      createdByName: 'foobar', // should not be able to give this
      createdAt: unixtimeNow({ substract: { minutes: 1 } }), // should not be able to give this
      updatedAt: unixtimeNow({ add: { minutes: 1 } }) // should not be able to give this
    }
  }
}

export const updateStoryRequest = (): UpdateStoryRequest => {
  return {
    ...{
      id: storyDTOMock().id,
      visibility: VisibilityEnum.Private,
      image: imageDTOMock(),
      name: 'test story name changed',
      description: 'A test story with a new description.',
      createdById: '123', // should not be able to change this
      createdByName: 'foobar', // should not be able to change this
      createdAt: unixtimeNow({ substract: { minutes: 1 } }), // should not be able to change this
      updatedAt: unixtimeNow({ add: { minutes: 1 } }) // should not be able to change this
    }
  }
}

export const storyMockWithoutImage = (): Story => {
  const story = Story.reconstruct({ ...storyDTOMock(), image: null })

  // Spy on the methods but retain their original implementations
  vi.spyOn(story, 'getProps').mockImplementation(function (this: Story) {
    return Story.prototype.getProps.apply(this)
  })
  vi.spyOn(story, 'update').mockImplementation(function (this: Story, props: Partial<StoryProps>) {
    Story.prototype.update.apply(this, [props])
  })
  vi.spyOn(story, 'delete').mockImplementation(function (this: Story) {
    Story.prototype.delete.apply(this)
  })
  vi.spyOn(story, 'addDomainEvent').mockImplementation(function (this: Story, event: IDomainEvent) {
    Story.prototype.addDomainEvent.apply(this, [event])
  })
  vi.spyOn(story, 'clearEvents').mockImplementation(function (this: Story) {
    Story.prototype.clearEvents.apply(this)
  })
  // TODO: Add more spies here, e.g. getters and setters?

  return story
}

export const storyMock = (): Story => {
  const story = Story.reconstruct(storyDTOMock())

  // Spy on the methods but retain their original implementations
  vi.spyOn(story, 'getProps').mockImplementation(function (this: Story) {
    return Story.prototype.getProps.apply(this)
  })
  vi.spyOn(story, 'update').mockImplementation(function (this: Story, props: Partial<StoryProps>) {
    Story.prototype.update.apply(this, [props])
  })
  vi.spyOn(story, 'delete').mockImplementation(function (this: Story) {
    Story.prototype.delete.apply(this)
  })
  vi.spyOn(story, 'addDomainEvent').mockImplementation(function (this: Story, event: IDomainEvent) {
    Story.prototype.addDomainEvent.apply(this, [event])
  })
  vi.spyOn(story, 'clearEvents').mockImplementation(function (this: Story) {
    Story.prototype.clearEvents.apply(this)
  })
  // TODO: Add more spies here, e.g. getters and setters?

  return story
}

export const createUserRequest = (): CreateUserRequest => {
  return {
    ...{
      id: 'not ok id', // should not be able to give this
      name: 'username',
      email: 'email@test.com',
      roles: [UserRoleEnum.Admin],
      password: 'password',
      active: false, // should not be able to give this
      createdAt: unixtimeNow({ substract: { minutes: 1 } }), // should not be able to give this
      updatedAt: unixtimeNow({ add: { minutes: 1 } }) // should not be able to give this
    }
  }
}

export const updateUserRequest = (): UpdateUserRequest => {
  return {
    ...{
      id: userDTOMock().id,
      email: 'updatedemail',
      oldPassword: 'password',
      newPassword: 'updatedPassword',
      name: 'updated name',
      password: 'some password', // should not be able to change this directly
      roles: [UserRoleEnum.Editor, UserRoleEnum.Moderator],
      active: false,
      createdAt: unixtimeNow({ substract: { minutes: 1 } }), // should not be able to change this,
      updatedAt: unixtimeNow({ add: { minutes: 1 } }) // should not be able to change this
    }
  }
}

export const userMock = (customProps?: Partial<UserProps> | null): User => {
  const user = User.reconstruct({ ...userDTOMock(), ...customProps })

  // Spy on the methods but retain their original implementations
  vi.spyOn(user, 'getProps').mockImplementation(function (this: User) {
    return User.prototype.getProps.apply(this)
  })

  return user
}

export const imageMock = (): Image => {
  return Image.reconstruct(imageDTOMock())
}

export const connectionMock = (): Mocked<Connection> => {
  return {
    getConnection: vi.fn(),
    destroy: vi.fn()
  }
}

export const domainEventDispatcherMock = (): Mocked<IDomainEventDispatcher> => {
  return {
    register: vi.fn(),
    dispatch: vi.fn()
  }
}

export const imageProcessingServiceMock = (): Mocked<IImageProcessingService> => {
  class ImageProcessingService implements Mocked<IImageProcessingService> {
    resizeImage = vi.fn()
    getBufferMimeType = vi.fn()
  }

  return new ImageProcessingService()
}

export const imageStorageServiceMock = (): Mocked<IImageStorageService> => {
  class ImageStorageService implements Mocked<IImageStorageService> {
    writeImageBufferToFile = vi.fn()
    getImageFromFileSystem = vi.fn()
    deleteImageFromFileSystem = vi.fn()
    renameImage = vi.fn()
    clearLastLoadedMap = vi.fn()
  }

  return new ImageStorageService()
}

export const storyMapperMock = ({ dto, entity }: { dto?: any; entity?: any } | undefined = {}): Mocked<IStoryApplicationMapper> => {
  class StoryMapperMock implements Mocked<IStoryApplicationMapper> {
    toDTO = vi.fn().mockReturnValue(dto || storyDTOMock())
    dtoToDomainEntity = vi.fn().mockReturnValue(entity || storyMock())
    createInputToDomainEntity = vi.fn().mockReturnValue(entity || storyMock())
    updateInputToDomainEntity = vi.fn().mockReturnValue(entity || storyMock())
    toDomainEntity = vi.fn().mockReturnValue(entity || storyMock())
  }

  return new StoryMapperMock()
}

export const storyMapperImplementation = (): IStoryApplicationMapper => {
  return new StoryApplicationMapper(new StoryFactory())
}

export const userRepositoryMock = (): Mocked<IUserRepository> => {
  class UserRepositoryMock implements IUserRepository {
    getAll = vi.fn().mockResolvedValue([userMock()])
    findById = vi.fn().mockResolvedValue(userMock())
    getUserCredentialsByUserId = vi.fn().mockResolvedValue({ userId: '1', passwordHash: '1' })
    getUserCredentialsByUsername = vi.fn().mockResolvedValue({ userId: '1', passwordHash: '1' })
    findByName = vi.fn().mockResolvedValue(userMock())
    count = vi.fn().mockResolvedValue(userMock())
    insert = vi.fn().mockResolvedValue(userMock())
    update = vi.fn().mockResolvedValue(userMock())
    deactivate = vi.fn().mockResolvedValue(userMock())
    setTransaction = vi.fn()
    clearLastLoadedMap = vi.fn()
  }
  return new UserRepositoryMock()
}

export const storyRepositoryMock = (): Mocked<IStoryRepository> => {
  class StoryRepositoryMock implements IStoryRepository {
    insert = vi.fn().mockResolvedValue(storyMock())
    update = vi.fn().mockResolvedValue(storyMock())
    count = vi.fn().mockResolvedValue(1)
    search = vi.fn().mockResolvedValue([storyMock()])
    findAllPublic = vi.fn().mockResolvedValue([storyMock()])
    findById = vi.fn().mockResolvedValue(storyMock())
    findByImageId = vi.fn().mockResolvedValue([storyMock()])
    findAllVisibleForLoggedInCreator = vi.fn().mockResolvedValue([storyMock()])
    findAllForCreator = vi.fn().mockResolvedValue([storyMock()])
    findLatest = vi.fn().mockResolvedValue([storyMock()])
    findStoriesOfCreatorByName = vi.fn().mockResolvedValue([storyMock()])
    countAll = vi.fn().mockResolvedValue(1)
    countStoriesByCreator = vi.fn().mockResolvedValue(1)
    delete = vi.fn().mockResolvedValue(storyMock())
    setTransaction = vi.fn()
    clearLastLoadedMap = vi.fn()
  }
  return new StoryRepositoryMock()
}

export const imageRepositoryMock = (): Mocked<IImageRepository> => {
  class ImageRepositoryMock implements IImageRepository {
    findById = vi.fn().mockResolvedValue(imageMock())
    insert = vi.fn().mockResolvedValue(imageMock())
    update = vi.fn().mockResolvedValue(imageMock())
    delete = vi.fn()
    setTransaction = vi.fn()
    clearLastLoadedMap = vi.fn()
  }
  return new ImageRepositoryMock()
}

export function createMockKnex() {
  const commitSpy = vi.fn()
  const rollbackSpy = vi.fn()
  const transactionMock = vi.fn()

  let transactionWasCompleted = false

  function createTransactionKnexInstance(): Knex {
    const mockedKnexFunction = vi.fn(() => transactionKnexInstance) as unknown as Knex

    const transactionKnexInstance = new Proxy(mockedKnexFunction, {
      get(_target, propertyName: string) {
        if (propertyName === 'commit') {
          return vi.fn((...args: unknown[]) => {
            transactionWasCompleted = true
            commitSpy(...args)
            return Promise.resolve()
          })
        }

        if (propertyName === 'rollback') {
          return vi.fn((...args: unknown[]) => {
            transactionWasCompleted = true
            rollbackSpy(...args)
            return Promise.resolve()
          })
        }

        if (propertyName === 'isCompleted') {
          return () => transactionWasCompleted
        }

        if (propertyName === 'then') {
          return undefined // Avoid treating 'this' as a thenable
        }

        // For any other property, return a chainable stub
        return vi.fn(() => transactionKnexInstance)
      }
    }) as unknown as Knex

    return transactionKnexInstance
  }

  transactionMock.mockImplementation(async (transactionCallback: (transactionKnex: Knex) => Promise<unknown>) => {
    const transactionKnex = createTransactionKnexInstance()
    try {
      return await transactionCallback(transactionKnex)
    } catch (error) {
      if (!transactionWasCompleted) {
        rollbackSpy(error) // fallback in case rollback wasn’t called explicitly
      }
      throw error
    }
  })

  const rootKnexFunction = vi.fn(() => rootKnexInstance) as unknown as Knex

  const rootKnexInstance = new Proxy(rootKnexFunction, {
    get(_target, propertyName: string) {
      if (propertyName === 'transaction') {
        return transactionMock
      }

      if (propertyName === 'then') {
        return undefined // Avoid treating 'this' as a thenable
      }

      return vi.fn(() => rootKnexInstance)
    }
  }) as unknown as Knex

  return {
    knexMock: rootKnexInstance,
    commitSpy,
    rollbackSpy
  }
}

export const connectionProviderFactory = (): {
  connectionProvider: IDatabaseConnectionProvider<Knex>
  commitSpy: any
  rollbackSpy: any
} => {
  const { knexMock, commitSpy, rollbackSpy } = createMockKnex()
  return {
    connectionProvider: { getConnection: () => Promise.resolve(knexMock) },
    commitSpy,
    rollbackSpy
  }
}

export const transactionManagerFactory = (): {
  transactionManagerMock: ITransactionManager
  domainEventDispatcherMock: Mocked<IDomainEventDispatcher>
  executeSpy: any
  commitSpy: any
  rollbackSpy: any
} => {
  const { connectionProvider, commitSpy, rollbackSpy } = connectionProviderFactory()
  const domainEventDispatcher = domainEventDispatcherMock()
  const transactionManager = new TransactionManager(connectionProvider, domainEventDispatcher)

  const executeSpy = vi.spyOn(transactionManager, 'execute')

  return {
    transactionManagerMock: transactionManager,
    domainEventDispatcherMock: domainEventDispatcher,
    executeSpy,
    commitSpy,
    rollbackSpy
  }
}

export const authorizationServiceMock = (): Mocked<IAuthorizationService> => {
  class AuthorizationServiceMock implements IAuthorizationService {
    canCreateStory = vi.fn().mockReturnValue({ isAuthorized: true })
    canUpdateStory = vi.fn().mockReturnValue({ isAuthorized: true })
    canDeleteStory = vi.fn().mockReturnValue({ isAuthorized: true })
    canRemoveImageFromStory = vi.fn().mockReturnValue({ isAuthorized: true })
    canViewStory = vi.fn().mockReturnValue({ isAuthorized: true })
    canSearchStories = vi.fn().mockReturnValue({ isAuthorized: true })
    canCreateImage = vi.fn().mockReturnValue({ isAuthorized: true })
    canUpdateImage = vi.fn().mockReturnValue({ isAuthorized: true })
    canCreateUser = vi.fn().mockReturnValue({ isAuthorized: true })
    canUpdateUser = vi.fn().mockReturnValue({ isAuthorized: true })
    canDeactivateUser = vi.fn().mockReturnValue({ isAuthorized: true })
    canViewUser = vi.fn().mockReturnValue({ isAuthorized: true })
    canListAllUsers = vi.fn().mockReturnValue({ isAuthorized: true })
  }
  return new AuthorizationServiceMock()
}

export const authorizationMock = (): Mocked<Authorization> => {
  class AuthorizationMock extends Authorization {
    // mock the public methods we use in tests
    createAuthToken = vi.fn().mockReturnValue('auth-token')
    createRefreshToken = vi.fn().mockReturnValue('refresh-token')
    verifyRefreshToken = vi.fn().mockReturnValue({ userId: 'user-id' })
  }

  return new AuthorizationMock() as Mocked<Authorization>
}

export const storyFactoryMock = (): Mocked<IStoryFactory> => {
  class StoryFactoryMock implements IStoryFactory {
    createStory = vi.fn().mockReturnValue(EntityFactoryResult.ok(storyMock()))
  }

  return new StoryFactoryMock()
}

export const userFactoryMock = (): Mocked<IUserFactory> => {
  class UserFactoryMock implements IUserFactory {
    createUser = vi.fn().mockReturnValue(EntityFactoryResult.ok(userMock()))
  }

  return new UserFactoryMock()
}

export const expectErrorWraps = async (
  promise: Promise<unknown>,
  expectedRootCauseType: new (...args: any[]) => Error,
  expectedCauseType: new (...args: any[]) => Error
) => {
  const error = await promise
    .then(() => {
      throw new Error('Expected promise to reject but it resolved.')
    })
    .catch((e) => e as unknown)

  expect(error).toBeInstanceOf(expectedRootCauseType)
  expect((error as Error).stack).toContain(expectedCauseType.name)
}

export const base64ImageBufferMock = (): Buffer => {
  return Buffer.from(base64Payload, 'base64')
}

export const base64ImageMock = (): string => {
  return `${BASE64_PREFIX},${base64Payload}`
}
