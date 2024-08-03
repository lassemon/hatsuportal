import { IUserCredentials, Password, User, UserId, UserName } from '../../domain'

export interface IUserRepository {
  getAll(): Promise<User[]>
  findById(userId: UserId): Promise<User | null>
  getUserCredentialsByUserId(userId: UserId): Promise<IUserCredentials | null>
  getUserCredentialsByUsername(username: UserName): Promise<IUserCredentials | null>
  findByName(username: UserName): Promise<User | null>
  count(): Promise<number>
  insert(user: User, password: Password): Promise<User>
  update(user: User, password?: Password): Promise<User>
  deactivate(user: User): Promise<User>
}
