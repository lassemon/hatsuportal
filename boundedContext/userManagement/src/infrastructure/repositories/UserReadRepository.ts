import { ImageRoleEnum } from '@hatsuportal/common'
import { RepositoryBase, IDataAccessProvider, IRepositoryHelpers, ITransactionContext } from '@hatsuportal/platform'
import { ProfileImageId, UserId, UserName } from '../../domain'
import { IUserReadRepository, UserReadModelDTO } from '../../application'
import { IUserInfrastructureMapper } from '../mappers/UserInfrastructureMapper'
import { UserImageLinkDatabaseSchema } from '../schemas/UserImageLinkDatabaseSchema'
import { UserReadDatabaseSchema } from '../schemas/UserReadDatabaseSchema'

export class UserReadRepository extends RepositoryBase implements IUserReadRepository {
  private readonly preferencesTable = 'user_preferences'
  private readonly imageLinkTable = 'user_image_links'

  constructor(
    dataAccessProvider: IDataAccessProvider,
    helpers: IRepositoryHelpers,
    transactionContext: ITransactionContext,
    private readonly userMapper: IUserInfrastructureMapper
  ) {
    super(dataAccessProvider, helpers, transactionContext, 'user_enriched_read_view')
  }

  async findById(userId: UserId): Promise<UserReadModelDTO | null> {
    const row = await this.table<UserReadDatabaseSchema>().select('*').where('id', userId.value).first()
    return row ? this.userMapper.toDTO(row) : null
  }

  async findAll(): Promise<UserReadModelDTO[]> {
    const rows = await this.table<UserReadDatabaseSchema>().select('*')
    return rows.map((row) => this.userMapper.toDTO(row))
  }

  async findByName(username: UserName): Promise<UserReadModelDTO | null> {
    const row = await this.table<UserReadDatabaseSchema>().select('*').where('name', username.value).first()
    return row ? this.userMapper.toDTO(row) : null
  }

  async findAllReferencedProfileImageIds(): Promise<string[]> {
    const database = await this.database()
    const rows = await database
      .table<Pick<UserImageLinkDatabaseSchema, 'imageId'>>(this.imageLinkTable)
      .distinct()
      .select('imageId')
      .where('role', ImageRoleEnum.ProfilePicture)
    return rows.map((row) => row.imageId)
  }

  async findByProfileImageId(profileImageId: ProfileImageId): Promise<UserReadModelDTO[]> {
    const rows = await this.table<UserReadDatabaseSchema>().select('*').where('profileImageId', profileImageId.value)
    return rows.map((row) => this.userMapper.toDTO(row))
  }

  async findUserIdsBySelectedThemeId(themeId: string): Promise<string[]> {
    const database = await this.database()
    const rows = await database.table<{ userId: string }>(this.preferencesTable).select('userId').where('selectedThemeId', themeId)
    return rows.map((row) => row.userId)
  }

  invalidateById(_userId: UserId): void {
    // no-op on base repo — consolidates IUserReadRepository interface
  }
}
