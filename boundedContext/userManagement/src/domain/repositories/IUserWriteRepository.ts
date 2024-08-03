import { IUserCredentials, Password, User, UserId, UserName } from '../../domain'

/**
 * Write port for the User aggregate (root + profile + preferences + profile image link).
 * Interface signatures are stable; implementations load and persist the full aggregate.
 */
export interface IUserWriteRepository {
  findById(userId: UserId): Promise<User | null>
  findByIdForUpdate(userId: UserId): Promise<User | null>
  getUserCredentialsByUserId(userId: UserId): Promise<IUserCredentials | null>
  getUserCredentialsByUsername(username: UserName): Promise<IUserCredentials | null>
  findByName(username: UserName): Promise<User | null>
  count(): Promise<number>
  insert(user: User, password: Password): Promise<User>
  update(user: User, password?: Password): Promise<User>
  deactivate(user: User): Promise<User>
}
