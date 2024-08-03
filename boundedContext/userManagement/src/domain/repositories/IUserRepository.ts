import { Password } from '../valueObjects/Password'
import { UserName } from '../valueObjects/UserName'
import { UserId } from '../valueObjects/UserId'
import { IRepository } from '@hatsuportal/common-bounded-context'
import { User } from '../entities/User'
import { UserCredentials } from '../models/UserCredentials'

export interface IUserRepository extends IRepository {
  getAll(): Promise<User[]>
  findById(userId: UserId): Promise<User | null>
  getUserCredentialsByUserId(userId: UserId): Promise<UserCredentials | null>
  getUserCredentialsByUsername(username: UserName): Promise<UserCredentials | null>
  findByName(username: UserName): Promise<User | null>
  count(): Promise<number>
  insert(user: User, password: Password): Promise<User>
  update(user: User, password?: Password): Promise<User>
  deactivate(userId: UserId): Promise<void>
}
