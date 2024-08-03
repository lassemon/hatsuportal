import {
  User,
  IUserCredentials,
  Password,
  UserId,
  UserName,
  IUserRepository,
  IUserInfrastructureMapper,
  UserDatabaseSchema
} from '@hatsuportal/user-management'
import { Repository } from './Repository'
import {
  ConcurrencyError,
  DataPersistenceError,
  ForbiddenError,
  NotFoundError,
  NotImplementedError,
  ITransactionAware
} from '@hatsuportal/platform'
import { Logger, unixtimeNow } from '@hatsuportal/common'
import { UnixTimestamp } from '@hatsuportal/shared-kernel'

const logger = new Logger('UserRepository')

// TODO, refactor to write and read repositories
// and implement optimistic locking pattern
// into findByIdForUpdate same as in StoryWriteRepository
export class UserRepository extends Repository implements IUserRepository, ITransactionAware {
  // Define secure column selections to avoid exposing sensitive data
  private readonly secureUserColumns = ['id', 'name', 'email', 'active', 'roles', 'createdAt', 'updatedAt']

  constructor(private readonly userMapper: IUserInfrastructureMapper) {
    super('users')
  }

  async getAll(): Promise<User[]> {
    const database = await this.databaseOrTransaction()
    const userRecords = await database(this.tableName).select(this.secureUserColumns).from<UserDatabaseSchema>(this.tableName)
    return userRecords.map((record) => this.toDomainEntity(record))
  }

  async findById(userId: UserId): Promise<User | null> {
    logger.debug(`Finding user by id ${userId.value} from table ${this.tableName}`)
    const database = await this.databaseOrTransaction()
    const userRecord = await database(this.tableName)
      .select(this.secureUserColumns)
      .from<UserDatabaseSchema>(this.tableName)
      .where('id', userId.value)
      .first()
    if (!userRecord) {
      return null
    }
    return this.toDomainEntity(userRecord)
  }

  // NEVER TO BE USED OUTSIDE OF THIS REPOSITORY
  // RAW in this case means without converting the stringified json data into json
  private async findUserByIdRAW(userId: string): Promise<UserDatabaseSchema | null> {
    const database = await this.databaseOrTransaction()
    const userRecord = await database(this.tableName)
      .select(this.secureUserColumns)
      .from<UserDatabaseSchema>(this.tableName)
      .where('id', userId)
      .first()
    if (!userRecord) {
      return null
    }
    return userRecord
  }

  async getUserCredentialsByUserId(userId: UserId): Promise<IUserCredentials | null> {
    const database = await this.databaseOrTransaction()
    const userRecordWithPassword = await database(this.tableName)
      .select(['id', 'password']) // Only select what's needed for credentials
      .from<UserDatabaseSchema>(this.tableName)
      .where('id', userId.value)
      .first()
    if (!userRecordWithPassword) {
      return null
    }
    return {
      userId: userRecordWithPassword.id,
      passwordHash: userRecordWithPassword.password
    }
  }

  async getUserCredentialsByUsername(username: UserName): Promise<IUserCredentials | null> {
    const database = await this.databaseOrTransaction()
    const userRecordWithPassword = await database(this.tableName)
      .select(['id', 'password']) // Only select what's needed for credentials
      .from<UserDatabaseSchema>(this.tableName)
      .where('name', username.value)
      .first()
    if (!userRecordWithPassword) {
      return null
    }
    return {
      userId: userRecordWithPassword.id,
      passwordHash: userRecordWithPassword.password
    }
  }

  async findByName(username: UserName): Promise<User | null> {
    const database = await this.databaseOrTransaction()
    const userRecord = await database(this.tableName)
      .select(this.secureUserColumns)
      .from<UserDatabaseSchema>(this.tableName)
      .where('name', username.value)
      .first()
    if (!userRecord) {
      return null
    }
    return this.toDomainEntity(userRecord)
  }

  async count(): Promise<number> {
    throw new NotImplementedError('NotImplemented')
  }

  async insert(user: User, password: Password): Promise<User> {
    try {
      await this.ensureUniqueId(user.id)

      const userToInsert = await this.userMapper.toInsertQuery(user, password)
      const database = await this.databaseOrTransaction()
      await database(this.tableName).insert(userToInsert)

      const insertedUser = await this.findById(new UserId(userToInsert.id))
      if (!insertedUser) {
        throw new NotFoundError('Just created user could not be retrieved')
      }

      return insertedUser
    } catch (error) {
      return this.throwDataPersistenceError(error)
    }
  }

  async update(user: User, password?: Password): Promise<User> {
    const baseline = this.lastLoadedMap.get(user.id.value)
    if (!baseline) throw new DataPersistenceError('Repository did not load this User')

    const userToUpdate = await this.userMapper.toUpdateQuery(user, password)
    const database = await this.databaseOrTransaction()

    // Optimistic locking pattern
    const affected = await database(this.tableName).where({ id: userToUpdate.id, updatedAt: baseline.value }).update(userToUpdate)
    if (affected === 0) throw new ConcurrencyError<User>(`User ${user.id} was modified by another user`, user)

    const updatedUser = await this.findById(new UserId(userToUpdate.id))

    if (!updatedUser) {
      throw new NotFoundError('Just updated user could not be retrieved')
    }
    return updatedUser
  }

  async deactivate(user: User): Promise<User> {
    const baseline = this.lastLoadedMap.get(user.id.value)
    if (!baseline) throw new DataPersistenceError('Repository did not load this User')

    const userToDeactivate = await this.findUserByIdRAW(user.id.value)
    if (!userToDeactivate) {
      throw new NotFoundError(`User deactivation failed because user '${user.id.value}' could not be found from the database.`)
    }

    const database = await this.databaseOrTransaction()

    const affected = await database(this.tableName).where({ id: user.id.value, updatedAt: baseline.value }).update({
      active: 0,
      updatedAt: unixtimeNow()
    })
    if (affected === 0)
      throw new ConcurrencyError<User>(
        `User ${user.id.value} was modified by another user`,
        // mapping here sets new baseline for last loaded timestamp but it doesn't matter because the concurrency already failed.
        // Possibly even better that the baseline is reset so that the deactivation counts as access to the entity
        // even if it failed
        this.userMapper.toDomainEntity(userToDeactivate)
      )

    const deactivatedUser = await this.findUserByIdRAW(user.id.value)

    if (!deactivatedUser) {
      throw new NotFoundError(
        `User deactivation failed because just deactivated user '${user.id.value}' could not be retrieved from the database.`
      )
    }

    const domainEntity = this.toDomainEntity(deactivatedUser)
    return domainEntity
  }

  private async ensureUniqueId(id: UserId): Promise<void> {
    const previousUser = await this.findById(id)
    if (previousUser) {
      throw new ForbiddenError(`Cannot create user with id ${id} because it already exists.`)
    }
  }

  private toDomainEntity(user: UserDatabaseSchema): User {
    this.lastLoadedMap.set(user.id, new UnixTimestamp(user.updatedAt || unixtimeNow()))
    return this.userMapper.toDomainEntity(user)
  }
}
