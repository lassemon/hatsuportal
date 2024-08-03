import { unixtimeNow, ImageRoleEnum } from '@hatsuportal/common'
import { UnixTimestamp } from '@hatsuportal/shared-kernel'
import {
  RepositoryBase,
  IDataAccessProvider,
  IRepositoryHelpers,
  ITransactionContext,
  ConcurrencyError,
  NotFoundError,
  NotImplementedError
} from '@hatsuportal/platform'
import { IUserWriteRepository, User, UserId, UserName, IUserCredentials, Password } from '../../domain'
import { UserAggregateDatabaseSchema, UserDatabaseSchema } from '../schemas/UserDatabaseSchema'
import { IUserInfrastructureMapper } from '../mappers/UserInfrastructureMapper'

export class UserWriteRepository extends RepositoryBase implements IUserWriteRepository {
  // Define secure column selections to avoid exposing sensitive data
  private readonly secureUserColumns = ['id', 'name', 'email', 'active', 'roles', 'createdAt', 'updatedAt']
  private readonly imageLinkTable = 'user_image_links'
  private readonly profileTable = 'user_profiles'
  private readonly preferencesTable = 'user_preferences'

  constructor(
    dataAccessProvider: IDataAccessProvider,
    helpers: IRepositoryHelpers,
    transactionContext: ITransactionContext,
    private readonly userMapper: IUserInfrastructureMapper
  ) {
    super(dataAccessProvider, helpers, transactionContext, 'users')
  }

  async findById(userId: UserId): Promise<User | null> {
    const user = await this.findUserByIdRAW(userId.value)
    if (!user) {
      return null
    }
    return this.toDomainEntity(user)
  }

  async findByIdForUpdate(userId: UserId): Promise<User | null> {
    const userRecord = await this.table<UserDatabaseSchema>().select(this.secureUserColumns).where('id', userId.value).forUpdate().first()
    if (!userRecord) {
      return null
    }

    this.registerExpectedUpdatedAt(userRecord.id, new UnixTimestamp(userRecord.updatedAt || unixtimeNow()))

    const user = await this.findUserByIdRAW(userId.value)
    if (!user) {
      return null
    }
    return this.toDomainEntity(user)
  }

  async getUserCredentialsByUserId(userId: UserId): Promise<IUserCredentials | null> {
    const userRecordWithPassword = await this.table<UserDatabaseSchema>().select(['id', 'password']).where('id', userId.value).first()
    if (!userRecordWithPassword) {
      return null
    }
    return {
      userId: userRecordWithPassword.id,
      passwordHash: userRecordWithPassword.password
    }
  }

  async getUserCredentialsByUsername(username: UserName): Promise<IUserCredentials | null> {
    const userRecordWithPassword = await this.table<UserDatabaseSchema>().select(['id', 'password']).where('name', username.value).first()
    if (!userRecordWithPassword) {
      return null
    }
    return {
      userId: userRecordWithPassword.id,
      passwordHash: userRecordWithPassword.password
    }
  }

  async findByName(username: UserName): Promise<User | null> {
    const userRecord = await this.table<UserDatabaseSchema>().select(['id']).where('name', username.value).first()
    if (!userRecord) {
      return null
    }
    const user = await this.findUserByIdRAW(userRecord.id)
    if (!user) {
      return null
    }
    return this.toDomainEntity(user)
  }

  async count(): Promise<number> {
    throw new NotImplementedError('NotImplemented')
  }

  async insert(user: User, password: Password): Promise<User> {
    try {
      const previousUser = await this.findById(user.id)
      if (previousUser) {
        return previousUser
      }

      const userToInsert = await this.userMapper.toInsertQuery(user, password)

      await this.table<UserDatabaseSchema>().insert({
        ...userToInsert,
        roles: this.database().raw('?::jsonb', [JSON.stringify(userToInsert.roles)])
      })

      const database = this.database()
      await database.table(this.profileTable).insert(this.userMapper.toProfileRecord(user))
      await database.table(this.preferencesTable).insert(this.userMapper.toPreferencesRecord(user))

      await this.syncProfileImageLink(user)

      const reloaded = await this.findUserByIdRAW(user.id.value)
      if (!reloaded) {
        throw new NotFoundError('Just created user could not be retrieved')
      }

      return this.toDomainEntity(reloaded)
    } catch (error) {
      return this.helpers.throwDataPersistenceError(error)
    }
  }

  async update(user: User, password?: Password): Promise<User> {
    const expectedUpdatedAt = this.requireExpectedUpdatedAt(user.id.value)
    const userToUpdate = await this.userMapper.toUpdateQuery(user, password)

    const affected = await this.table<UserDatabaseSchema>()
      .where({ id: userToUpdate.id, updatedAt: expectedUpdatedAt.value })
      .update({
        ...userToUpdate,
        roles: this.database().raw('?::jsonb', [JSON.stringify(userToUpdate.roles)])
      })
    if (affected.length === 0) throw new ConcurrencyError<User>(`User ${user.id} was modified by another user`, user)

    const database = this.database()
    await database.table(this.profileTable).insert(this.userMapper.toProfileRecord(user)).onConflict('userId').merge()

    await database.table(this.preferencesTable).insert(this.userMapper.toPreferencesRecord(user)).onConflict('userId').merge()

    await this.syncProfileImageLink(user)

    const reloaded = await this.findUserByIdRAW(user.id.value)
    if (!reloaded) {
      throw new NotFoundError(`User update failed because just updated user '${user.id.value}' could not be found from the database.`)
    }
    return this.toDomainEntity(reloaded)
  }

  async deactivate(user: User): Promise<User> {
    const expectedUpdatedAt = this.requireExpectedUpdatedAt(user.id.value)

    const userToDeactivate = await this.findUserByIdRAW(user.id.value)
    if (!userToDeactivate) {
      throw new NotFoundError(`User deactivation failed because user '${user.id.value}' could not be found from the database.`)
    }

    const affected = await this.table<UserDatabaseSchema>().where({ id: user.id.value, updatedAt: expectedUpdatedAt.value }).update({
      active: 0,
      updatedAt: unixtimeNow()
    })
    if (affected.length === 0)
      throw new ConcurrencyError<User>(`User ${user.id.value} was modified by another user`, this.toDomainEntity(userToDeactivate))

    const reloaded = await this.findUserByIdRAW(user.id.value)
    if (!reloaded) {
      throw new NotFoundError(
        `User deactivation failed because just deactivated user '${user.id.value}' could not be retrieved from the database.`
      )
    }

    return this.toDomainEntity(reloaded)
  }

  // NEVER TO BE USED OUTSIDE OF THIS REPOSITORY
  // RAW in this case means without mapping to domain entities
  // but still including profile, preferences, and profile image link data
  private async findUserByIdRAW(userId: string): Promise<UserAggregateDatabaseSchema | null> {
    const database = this.database()
    const user = await database
      .table<UserAggregateDatabaseSchema>('users')
      .leftJoin(this.profileTable, (join) => join.on(`${this.profileTable}.user_id`, 'users.id'))
      .leftJoin(this.preferencesTable, (join) => join.on(`${this.preferencesTable}.user_id`, 'users.id'))
      .leftJoin(this.imageLinkTable, (join) =>
        join
          .on(`${this.imageLinkTable}.user_id`, 'users.id')
          .andOn(`${this.imageLinkTable}.role`, database.raw('?', [ImageRoleEnum.ProfilePicture]))
      )
      .select(this.aggregateSelectColumns())
      .where('users.id', userId)
      .first()

    if (!user) {
      return null
    }
    return user
  }

  private aggregateSelectColumns(): string[] {
    return [
      ...this.secureUserColumns.map((column) => `users.${column}`),
      `${this.profileTable}.bio as bio`,
      `${this.profileTable}.status_message as status_message`,
      `${this.preferencesTable}.color_scheme as color_scheme`,
      `${this.preferencesTable}.selected_theme_id as selected_theme_id`,
      `${this.preferencesTable}.notification_settings as notification_settings`,
      `${this.imageLinkTable}.image_id as profile_image_id`
    ]
  }

  private toDomainEntity(user: UserAggregateDatabaseSchema): User {
    return this.userMapper.toDomainEntity(user)
  }

  private async syncProfileImageLink(user: User): Promise<void> {
    const database = this.database()
    const imageLinkRow = this.userMapper.toProfileImageLinkRow(user)
    const existingImageLink = await database
      .table(this.imageLinkTable)
      .where({ userId: user.id.value, role: ImageRoleEnum.ProfilePicture })
      .first()

    if (imageLinkRow === null && existingImageLink) {
      await database.table(this.imageLinkTable).where({ userId: user.id.value, role: ImageRoleEnum.ProfilePicture }).delete()
      return
    }

    if (imageLinkRow && !existingImageLink) {
      await database.table(this.imageLinkTable).insert(imageLinkRow)
      return
    }

    if (imageLinkRow && existingImageLink && imageLinkRow.imageId !== existingImageLink.imageId) {
      await database.table(this.imageLinkTable).where({ userId: user.id.value, role: ImageRoleEnum.ProfilePicture }).update(imageLinkRow)
    }
  }
}
