import { ApiError, UnknownError, User, UserDatabaseEntity, UserRepositoryInterface } from '@hatsuportal/domain'
import { Logger, unixtimeNow } from '@hatsuportal/common'
import { DateTime } from 'luxon'
import { UserMapper } from '@hatsuportal/infrastructure'
import { InsertUserQueryDTO, UpdateUserQueryDTO } from '@hatsuportal/application'
import connection from '../common/database/connection'

const logger = new Logger('UserRepository')

class UserRepository implements UserRepositoryInterface<InsertUserQueryDTO, UpdateUserQueryDTO> {
  private userMapper: UserMapper

  constructor() {
    this.userMapper = new UserMapper()
  }

  async getAll(): Promise<User[]> {
    const userRecords = await connection.select('*').from<UserDatabaseEntity>('users')
    return userRecords.map(this.userMapper.toUser)
  }

  async findById(userId: string): Promise<User | null> {
    const userRecord = await connection.select('*').from<UserDatabaseEntity>('users').where('id', userId).first()
    if (!userRecord) {
      return null
    }
    return this.userMapper.toUser(userRecord)
  }

  async findWithPasswordById(userId: string): Promise<UserDatabaseEntity | null> {
    const userRecordWithPassword = await connection.select('*').from<UserDatabaseEntity>('users').where('id', userId).first()
    if (!userRecordWithPassword) {
      return null
    }
    return {
      ...userRecordWithPassword,
      active: userRecordWithPassword.active,
      roles: JSON.parse(userRecordWithPassword.roles)
    }
  }

  async findWithPasswordByName(username: string): Promise<UserDatabaseEntity | null> {
    const userRecordWithPassword = await connection.select('*').from<UserDatabaseEntity>('users').where('name', username).first()
    if (!userRecordWithPassword) {
      return null
    }
    return {
      ...userRecordWithPassword,
      active: userRecordWithPassword.active,
      roles: userRecordWithPassword.roles
    }
  }

  async findByName(username: string): Promise<User | null> {
    const userRecord = await connection.select('*').from<UserDatabaseEntity>('users').where('name', username).first()
    if (!userRecord) {
      return null
    }
    return this.userMapper.toUser(userRecord)
  }

  async count(): Promise<number> {
    throw new ApiError(501, 'NotImplemented')
  }

  async insert(insertQuery: InsertUserQueryDTO): Promise<User> {
    const updatedAt = DateTime.now().toUnixInteger()
    const userToInsert: UserDatabaseEntity = {
      ...insertQuery,
      roles: JSON.stringify(insertQuery.roles || []),
      createdAt: updatedAt,
      updatedAt: updatedAt
    }
    try {
      await connection<any, UserDatabaseEntity>('users').insert(userToInsert) // mariadb does not return inserted object
    } catch (error) {
      logger.error((error as any)?.message)
      throw new UnknownError(500, 'UnknownError')
    }

    const createdUserRecord = await this.findById(userToInsert.id)
    if (!createdUserRecord) {
      throw new ApiError(404, 'NotFound', 'Just created user could not be retrieved')
    }

    return createdUserRecord
  }

  async update(user: UpdateUserQueryDTO): Promise<User> {
    const updatedAt = unixtimeNow()
    const userToInsert = {
      ...user,
      updatedAt: updatedAt
    }
    try {
      await connection<any, UserDatabaseEntity>('users').where('id', userToInsert.id).update(userToInsert) // mariadb does not return inserted object
    } catch (error) {
      logger.error((error as any)?.message)
      throw new UnknownError(500, 'UnknownError')
    }

    const updatedUserRecord = await this.findById(user.id)
    if (!updatedUserRecord) {
      throw new ApiError(404, 'NotFound', 'Just updated user could not be retrieved')
    }
    return updatedUserRecord
  }

  async deactivate(userId: string): Promise<void> {
    throw new ApiError(501, 'NotImplemented')
  }
}

export default UserRepository
