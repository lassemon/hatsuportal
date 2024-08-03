import { UserReadModelDTO } from '../dtos/user/UserReadModelDTO'
import { ProfileImageId, UserId, UserName } from '../../domain'

export interface IUserReadRepository {
  findById(userId: UserId): Promise<UserReadModelDTO | null>
  findAll(): Promise<UserReadModelDTO[]>
  findByName(username: UserName): Promise<UserReadModelDTO | null>
  findAllReferencedProfileImageIds(): Promise<string[]>
  findByProfileImageId(profileImageId: ProfileImageId): Promise<UserReadModelDTO[]>
  /** To give notification to the user who is deleting a theme that there are other users who have selected that theme */
  findUserIdsBySelectedThemeId(themeId: string): Promise<string[]>
  invalidateById(userId: UserId): void
}
