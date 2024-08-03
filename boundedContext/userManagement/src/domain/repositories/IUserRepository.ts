import { Password } from '../valueObjects/Password'
import { UserName } from '../valueObjects/UserName'
import { UserId } from '../valueObjects/UserId'
import { IRepository } from '@hatsuportal/common-bounded-context'
import { User } from '../entities/User'
import { IUserCredentials } from '../models/IUserCredentials'

export interface IUserRepository extends IRepository {
  getAll(): Promise<User[]>
  findById(userId: UserId): Promise<User | null>
  getUserCredentialsByUserId(userId: UserId): Promise<IUserCredentials | null>
  getUserCredentialsByUsername(username: UserName): Promise<IUserCredentials | null>
  findByName(username: UserName): Promise<User | null>
  count(): Promise<number>
  insert(user: User, password: Password): Promise<User>
  update(user: User, password?: Password): Promise<User>
  deactivate(userId: UserId): Promise<User>
}
