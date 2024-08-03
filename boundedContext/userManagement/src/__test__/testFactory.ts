import { Mocked, vi } from 'vitest'
import { UserDatabaseSchema } from '../infrastructure/schemas/UserDatabaseSchema'
import { Email, User, UserId, UserName, UserProps, UserRole } from '../domain'
import { unixtimeNow, UserRoleEnum } from '@hatsuportal/common'
import { IDomainEventDispatcher, IDomainEventHolder, UnixTimestamp } from '@hatsuportal/shared-kernel'
import { cloneDeep } from 'lodash'
import { IUserAuthorizationService } from '../application/authorization/services/UserAuthorizationService'
import { ITokenService } from '../application/services/ITokenService'
import { IUserRepository } from '../domain'
import { ITransactionAware, ITransactionManager } from '@hatsuportal/platform'
import { CreateUserRequest, UpdateUserRequest } from '@hatsuportal/contracts'

const createdAt = unixtimeNow() - 3000
const updatedAt = createdAt + 1500

export const sampleUserId = 'test1b19-user-4792-a2f0-f95ccab82d92'
export const sampleUserName = 'username'
export const sampleEmail = 'email@test.com'
/**
 * this is the word 'passwordhash' encrypted with bcrypt
 */
export const samplePasswordHash = '$2a$10$Ktrlfz7aJd.Vnp4WZ7jvOeD21HoMZGorwPefzm0BOWyJ5SNgem8TW'

export class TestError extends Error {
  constructor(message: string) {
    super(message)
  }
}

export const userDatabaseRecord = (): UserDatabaseSchema => {
  return cloneDeep({
    id: userDTOMock().id,
    name: userDTOMock().name,
    password: samplePasswordHash,
    email: userDTOMock().email,
    roles: [UserRoleEnum.Admin, UserRoleEnum.Moderator], // json types are strings in database
    active: true,
    createdAt: userDTOMock().createdAt,
    updatedAt: userDTOMock().updatedAt
  })
}

export const userDTOMock = () => {
  return cloneDeep({
    id: sampleUserId,
    name: sampleUserName,
    email: sampleEmail,
    roles: [UserRoleEnum.Admin],
    active: true,
    createdAt,
    updatedAt
  })
}

export const userMock = (overrides: Partial<UserProps> = {}): User => {
  const user = User.reconstruct({
    id: overrides.id ? overrides.id : new UserId(userDTOMock().id),
    name: overrides.name ? overrides.name : new UserName(userDTOMock().name),
    email: overrides.email ? overrides.email : new Email(userDTOMock().email),
    active: typeof overrides.active !== 'undefined' ? overrides.active : userDTOMock().active,
    roles: overrides.roles ? overrides.roles : userDTOMock().roles.map((role) => new UserRole(role)),
    createdAt: overrides.createdAt ? overrides.createdAt : new UnixTimestamp(userDTOMock().createdAt),
    updatedAt: overrides.updatedAt ? overrides.updatedAt : new UnixTimestamp(userDTOMock().updatedAt)
  })

  // Spy on the methods but retain their original implementations
  vi.spyOn(user, 'serialize').mockImplementation(function (this: User) {
    return User.prototype.serialize.apply(this)
  })

  return user
}

export const userRepositoryMock = (): Mocked<IUserRepository & ITransactionAware> => {
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
    getTableName = vi.fn().mockReturnValue('users')
  }
  return new UserRepositoryMock()
}

export const tokenServiceMock = (): Mocked<ITokenService> => {
  class TokenServiceMock implements ITokenService {
    createAuthToken = vi.fn().mockReturnValue('new-auth-token')
    createRefreshToken = vi.fn().mockReturnValue('refresh-token')
    verifyRefreshToken = vi.fn().mockReturnValue({ userId: sampleUserId })
  }
  return new TokenServiceMock()
}

export const domainEventDispatcherMock = (): Mocked<IDomainEventDispatcher> => {
  return {
    register: vi.fn(),
    dispatch: vi.fn()
  }
}

export const transactionManagerMock = (domainEventDispatcherMock: Mocked<IDomainEventDispatcher>): ITransactionManager<UserId> => {
  class TransactionManagerMock implements ITransactionManager<UserId> {
    execute = async <T extends Array<IDomainEventHolder<UserId> | null>>(
      work: () => Promise<[...T]>,
      repositories?: ITransactionAware[]
    ): Promise<[...T]> => {
      const domainEventHolders = await work()

      for (const eventHolder of domainEventHolders) {
        if (eventHolder) {
          for (const event of eventHolder.domainEvents) {
            await domainEventDispatcherMock.dispatch(event)
          }
        }
      }
      domainEventHolders.forEach((eventHolder) => eventHolder && eventHolder.clearEvents())

      return domainEventHolders
    }
  }

  return new TransactionManagerMock()
}

export const userAuthorizationServiceMock = (): Mocked<IUserAuthorizationService> => {
  class UserAuthorizationServiceMock implements IUserAuthorizationService {
    canCreateUser = vi.fn().mockReturnValue({ allowed: true })
    canUpdateUser = vi.fn().mockReturnValue({ allowed: true })
    canDeactivateUser = vi.fn().mockReturnValue({ allowed: true })
    canViewUser = vi.fn().mockReturnValue({ allowed: true })
    canListAllUsers = vi.fn().mockReturnValue({ allowed: true })
  }
  return new UserAuthorizationServiceMock()
}

export const createUserRequest = (): CreateUserRequest => {
  return cloneDeep({
    id: 'not ok id', // should not be able to give this
    name: 'username',
    email: 'email@test.com',
    roles: [UserRoleEnum.Admin],
    password: 'password',
    active: false, // should not be able to give this
    createdAt: unixtimeNow({ substract: { minutes: 1 } }), // should not be able to give this
    updatedAt: unixtimeNow({ add: { minutes: 1 } }) // should not be able to give this
  })
}

export const updateUserRequest = (): UpdateUserRequest => {
  return cloneDeep({
    id: sampleUserId,
    email: 'updatedemail',
    oldPassword: 'password',
    newPassword: 'updatedPassword',
    name: 'updated name',
    password: 'some password', // should not be able to change this directly
    roles: [UserRoleEnum.Editor, UserRoleEnum.Moderator],
    active: false,
    createdAt: unixtimeNow({ substract: { minutes: 1 } }), // should not be able to change this,
    updatedAt: unixtimeNow({ add: { minutes: 1 } }) // should not be able to change this
  })
}
