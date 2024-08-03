import { ICache } from '@hatsuportal/platform'
import { IUserWriteRepository, User, UserId, UserName, IUserCredentials, Password } from '../../domain'

export class UserWriteRepositoryWithCache implements IUserWriteRepository {
  constructor(
    private readonly baseRepo: IUserWriteRepository,
    private readonly cache: ICache<User>
  ) {}

  async findById(userId: UserId): Promise<User | null> {
    const key = `findById:${userId.value}`
    if (!this.cache.has(key)) {
      const user = await this.baseRepo.findById(userId)
      this.cache.set(key, user)
    }
    const cached = this.cache.get(key)
    return cached ?? null
  }

  async findByIdForUpdate(userId: UserId): Promise<User | null> {
    return await this.baseRepo.findByIdForUpdate(userId)
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
    return cached ?? null
  }

  async count(): Promise<number> {
    return await this.baseRepo.count()
  }

  async insert(user: User, password: Password): Promise<User> {
    const result = await this.baseRepo.insert(user, password)
    this.cache.delete(`findById:${result.id.value}`)
    this.cache.delete(`findByName:${result.name.value}`)
    return result
  }

  async update(user: User, password?: Password): Promise<User> {
    const result = await this.baseRepo.update(user, password)
    this.cache.delete(`findById:${result.id.value}`)
    this.cache.invalidateByPrefix('findByName:')
    return result
  }

  async deactivate(user: User): Promise<User> {
    const result = await this.baseRepo.deactivate(user)
    this.cache.delete(`findById:${result.id.value}`)
    this.cache.delete(`findByName:${result.name.value}`)
    return result
  }
}
