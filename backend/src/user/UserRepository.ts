import { User, IUserRepository, UserCredentials, Password, UserId, UserName } from '@hatsuportal/domain'
import { Logger } from '@hatsuportal/common'
import { IUserInfrastructureMapper, UserDatabaseSchema, UserInfrastructureMapper } from '@hatsuportal/infrastructure'
import connection from '../common/database/connection'
import { DataPersistenceError, NotFoundError, NotImplementedError } from '@hatsuportal/application'

const logger = new Logger('UserRepository')

class UserRepository implements IUserRepository {
  private userMapper: IUserInfrastructureMapper

  constructor() {
    this.userMapper = new UserInfrastructureMapper()
  }

  async getAll(): Promise<User[]> {
    const userRecords = await connection.select('*').from<UserDatabaseSchema>('users')
    return userRecords.map((record) => new User(this.userMapper.toDTO(record)))
  }

  async findById(userId: UserId): Promise<User | null> {
    const userRecord = await connection.select('*').from<UserDatabaseSchema>('users').where('id', userId.value).first()
    if (!userRecord) {
      return null
    }
    return new User(this.userMapper.toDTO(userRecord))
  }

  async getUserCredentialsByUserId(userId: UserId): Promise<UserCredentials | null> {
    const userRecordWithPassword = await connection.select('*').from<UserDatabaseSchema>('users').where('id', userId.value).first()
    if (!userRecordWithPassword) {
      return null
    }
    return {
      userId: userRecordWithPassword.id,
      passwordHash: userRecordWithPassword.password
    }
  }

  async getUserCredentialsByUsername(username: UserName): Promise<UserCredentials | null> {
    const userRecordWithPassword = await connection.select('*').from<UserDatabaseSchema>('users').where('name', username.value).first()
    if (!userRecordWithPassword) {
      return null
    }
    return {
      userId: userRecordWithPassword.id,
      passwordHash: userRecordWithPassword.password
    }
  }

  async findByName(username: UserName): Promise<User | null> {
    const userRecord = await connection.select('*').from<UserDatabaseSchema>('users').where('name', username.value).first()
    if (!userRecord) {
      return null
    }
    return new User(this.userMapper.toDTO(userRecord))
  }

  async count(): Promise<number> {
    throw new NotImplementedError('NotImplemented')
  }

  async insert(user: User, password: Password): Promise<User> {
    const userToInsert = await this.userMapper.toInsertQuery(user, password)
    try {
      await connection<any, UserDatabaseSchema>('users').insert(userToInsert) // mariadb does not return inserted object
    } catch (error) {
      if (error instanceof Error) {
        logger.error((error as any)?.message)
        throw new DataPersistenceError(error.stack)
      } else {
        logger.error(error)
        throw new DataPersistenceError(`UnknownError`)
      }
    }

    const createdUserRecord = await this.findById(new UserId(userToInsert.id))
    if (!createdUserRecord) {
      throw new NotFoundError('Just created user could not be retrieved')
    }

    return createdUserRecord
  }

  async update(user: User, password?: Password): Promise<User> {
    const userToUpdate = await this.userMapper.toUpdateQuery(user, password)
    try {
      await connection<any, UserDatabaseSchema>('users').where('id', userToUpdate.id).update(userToUpdate) // mariadb does not return inserted object
    } catch (error) {
      if (error instanceof Error) {
        logger.error((error as any)?.message)
        throw new DataPersistenceError(error.stack)
      } else {
        logger.error(error)
        throw new DataPersistenceError(`UnknownError`)
      }
    }

    const updatedUserRecord = await this.findById(new UserId(userToUpdate.id))
    if (!updatedUserRecord) {
      throw new NotFoundError('Just updated user could not be retrieved')
    }
    return updatedUserRecord
  }

  async deactivate(userId: UserId): Promise<void> {
    throw new NotImplementedError('NotImplemented')
  }
}

export default UserRepository
