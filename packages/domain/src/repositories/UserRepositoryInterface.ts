import { User, UserDatabaseEntity } from '../entities/User'

// return User domain entity here instead of UserDTO
// to adhere to ddd princibles and allow the domain to directly work with a rich model
export interface UserRepositoryInterface<InsertUserQuery, UpdateUserQuery> {
  getAll(): Promise<User[]>
  findById(userId: string): Promise<User | null>
  findWithPasswordById(userId: string): Promise<UserDatabaseEntity | null>
  findWithPasswordByName(username: string): Promise<UserDatabaseEntity | null>
  findByName(username: string): Promise<User | null>
  count(): Promise<number>
  insert(user: InsertUserQuery): Promise<User>
  update(user: UpdateUserQuery): Promise<User>
  deactivate(userId: string): Promise<void>
}
