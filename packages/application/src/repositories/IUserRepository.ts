import { Password, User, UserCredentials, UserId, UserName } from '@hatsuportal/domain'

export interface IUserRepository {
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
