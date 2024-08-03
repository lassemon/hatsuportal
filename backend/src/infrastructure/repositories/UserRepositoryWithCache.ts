import { ITransaction } from '@hatsuportal/common-bounded-context'
import { IUserRepository, Password, User, UserCredentials, UserId, UserName } from '@hatsuportal/user-management'

export class UserRepositoryWithCache implements IUserRepository {
  constructor(private readonly baseRepo: IUserRepository, private readonly cache: Map<string, User | null>) {}

  async getAll(): Promise<User[]> {
    return await this.baseRepo.getAll()
  }

  async findById(userId: UserId): Promise<User | null> {
    const key = `findById:${userId.value}`
    if (!this.cache.has(key)) {
      const user = await this.baseRepo.findById(userId)
      this.cache.set(key, user)
    }
    return this.cache.get(key) || null
  }

  async getUserCredentialsByUserId(userId: UserId): Promise<UserCredentials | null> {
    return await this.baseRepo.getUserCredentialsByUserId(userId)
  }

  async getUserCredentialsByUsername(username: UserName): Promise<UserCredentials | null> {
    return await this.baseRepo.getUserCredentialsByUsername(username)
  }

  async findByName(username: UserName): Promise<User | null> {
    const key = `findByName:${username.value}`
    if (!this.cache.has(key)) {
      const user = await this.baseRepo.findByName(username)
      this.cache.set(key, user)
    }
    return this.cache.get(key) || null
  }

  async count(): Promise<number> {
    return await this.baseRepo.count()
  }

  async insert(user: User, password: Password): Promise<User> {
    return await this.baseRepo.insert(user, password)
  }

  async update(user: User, password?: Password): Promise<User> {
    return await this.baseRepo.update(user, password)
  }

  async deactivate(userId: UserId): Promise<User> {
    return await this.baseRepo.deactivate(userId)
  }

  setTransaction(transaction: ITransaction): void {
    this.baseRepo.setTransaction(transaction)
  }

  clearLastLoadedMap(): void {
    this.baseRepo.clearLastLoadedMap()
  }
}
