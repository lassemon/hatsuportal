import { ICache } from '@hatsuportal/platform'
import { ProfileImageId, UserId, UserName } from '../../domain'
import { IUserReadRepository, UserReadModelDTO } from '../../application'

export class UserReadRepositoryWithCache implements IUserReadRepository {
  constructor(
    private readonly baseRepo: IUserReadRepository,
    private readonly cache: ICache<UserReadModelDTO>
  ) {}

  async findById(userId: UserId): Promise<UserReadModelDTO | null> {
    const key = `findById:${userId.value}`
    if (!this.cache.has(key)) {
      const user = await this.baseRepo.findById(userId)
      this.cache.set(key, user)
    }
    return this.cache.get(key) ?? null
  }

  async findAll(): Promise<UserReadModelDTO[]> {
    return await this.baseRepo.findAll()
  }

  async findByName(username: UserName): Promise<UserReadModelDTO | null> {
    return await this.baseRepo.findByName(username)
  }

  async findAllReferencedProfileImageIds(): Promise<string[]> {
    return await this.baseRepo.findAllReferencedProfileImageIds()
  }

  async findByProfileImageId(profileImageId: ProfileImageId): Promise<UserReadModelDTO[]> {
    return await this.baseRepo.findByProfileImageId(profileImageId)
  }

  async findUserIdsBySelectedThemeId(themeId: string): Promise<string[]> {
    return await this.baseRepo.findUserIdsBySelectedThemeId(themeId)
  }

  invalidateById(userId: UserId): void {
    this.cache.delete(`findById:${userId.value}`)
  }
}
