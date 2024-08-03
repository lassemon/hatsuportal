import { ITransactionAware, ITransaction, ICache } from '@hatsuportal/platform'
import { IUserRepository, User, UserId, UserName, IUserCredentials, Password } from '../../domain'

export class UserRepositoryWithCache implements IUserRepository, ITransactionAware {
  constructor(
    private readonly baseRepo: IUserRepository & ITransactionAware,
    private readonly cache: ICache<User | User[]>
  ) {}

  async getAll(): Promise<User[]> {
    const key = 'getAll'
    if (!this.cache.has(key)) {
      const users = await this.baseRepo.getAll()
      this.cache.set(key, users)
    }
    const cached = this.cache.get(key)
    return Array.isArray(cached) ? cached : []
  }

  async findById(userId: UserId): Promise<User | null> {
    const key = `findById:${userId.value}`
    if (!this.cache.has(key)) {
      const user = await this.baseRepo.findById(userId)
      this.cache.set(key, user)
    }
    const cached = this.cache.get(key)
    return !Array.isArray(cached) ? (cached ?? null) : null
  }

  async getUserCredentialsByUserId(userId: UserId): Promise<IUserCredentials | null> {
    return await this.baseRepo.getUserCredentialsByUserId(userId)
  }

  async getUserCredentialsByUsername(username: UserName): Promise<IUserCredentials | null> {
    return await this.baseRepo.getUserCredentialsByUsername(username)
  }

  async findByName(username: UserName): Promise<User | null> {
    const key = `findByName:${username.value}`
    if (!this.cache.has(key)) {
      const user = await this.baseRepo.findByName(username)
      this.cache.set(key, user)
    }
    const cached = this.cache.get(key)
    return !Array.isArray(cached) ? (cached ?? null) : null
  }

  async count(): Promise<number> {
    return await this.baseRepo.count()
  }

  async insert(user: User, password: Password): Promise<User> {
    const result = await this.baseRepo.insert(user, password)
    this.cache.delete(`findById:${result.id.value}`)
    this.cache.delete(`findByName:${result.name.value}`)
    this.cache.delete('getAll')
    return result
  }

  async update(user: User, password?: Password): Promise<User> {
    const result = await this.baseRepo.update(user, password)
    this.cache.delete(`findById:${result.id.value}`)
    this.cache.delete(`findByName:${result.name.value}`)
    this.cache.delete('getAll')
    return result
  }

  async deactivate(user: User): Promise<User> {
    const result = await this.baseRepo.deactivate(user)
    this.cache.delete(`findById:${result.id.value}`)
    this.cache.delete(`findByName:${result.name.value}`)
    this.cache.delete('getAll')
    return result
  }

  getTableName(): string {
    return this.baseRepo.getTableName()
  }

  setTransaction(transaction: ITransaction): void {
    this.baseRepo.setTransaction(transaction)
  }

  clearLastLoadedMap(): void {
    this.baseRepo.clearLastLoadedMap()
  }
}
