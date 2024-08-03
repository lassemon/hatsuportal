import { unixtimeNow } from '@hatsuportal/common'
import { RepositoryBase, IDataAccessProvider, IRepositoryHelpers, ITransactionContext, ConcurrencyError } from '@hatsuportal/platform'
import { UnixTimestamp } from '@hatsuportal/shared-kernel'
import { IThemeRepository, Theme, ThemeId } from '../../domain'
import { IThemeInfrastructureMapper } from '../mappers/ThemeInfrastructureMapper'
import { ThemeDatabaseSchema } from '../schemas/ThemeDatabaseSchema'

export class ThemeRepository extends RepositoryBase implements IThemeRepository {
  constructor(
    dataAccessProvider: IDataAccessProvider,
    helpers: IRepositoryHelpers,
    transactionContext: ITransactionContext,
    private readonly themeMapper: IThemeInfrastructureMapper
  ) {
    super(dataAccessProvider, helpers, transactionContext, 'themes')
  }

  async findById(themeId: ThemeId): Promise<Theme | null> {
    const theme = await this.findByIdRAW(themeId.value)
    return theme ? this.themeMapper.toDomainEntity(theme) : null
  }

  async findByIdForUpdate(themeId: ThemeId): Promise<Theme | null> {
    const theme = await this.table<ThemeDatabaseSchema>().select('*').where('id', themeId.value).forUpdate().first()
    if (!theme) {
      return null
    }

    this.registerExpectedUpdatedAt(theme.id, new UnixTimestamp(theme.updatedAt || unixtimeNow()))

    return this.themeMapper.toDomainEntity(theme)
  }

  async findAll(): Promise<Theme[]> {
    const themes = await this.table<ThemeDatabaseSchema>().select('*')
    return themes.map((theme) => this.themeMapper.toDomainEntity(theme))
  }

  async insert(theme: Theme): Promise<Theme> {
    try {
      const previousTheme = await this.findById(theme.id)
      if (previousTheme) {
        return previousTheme
      }

      const themeToInsert = this.themeMapper.toThemeInsertRecord(theme)
      const affected = await this.table<ThemeDatabaseSchema>().insert(themeToInsert)
      if (affected.length === 0) throw new ConcurrencyError<Theme>(`Theme ${theme.id} was modified by another user`, theme)

      return this.themeMapper.toDomainEntity(affected[0])
    } catch (error: unknown) {
      return this.helpers.throwDataPersistenceError(error)
    }
  }

  async update(theme: Theme): Promise<Theme> {
    try {
      const expectedUpdatedAt = this.requireExpectedUpdatedAt(theme.id.value)

      const themeToUpdate = this.themeMapper.toThemeUpdateRecord(theme)
      const affected = await this.table<ThemeDatabaseSchema>()
        .where({ id: theme.id.value, updatedAt: expectedUpdatedAt.value })
        .update(themeToUpdate)
      if (affected.length === 0) throw new ConcurrencyError<Theme>(`Theme ${theme.id} was modified by another user`, theme)

      return this.themeMapper.toDomainEntity(affected[0])
    } catch (error: unknown) {
      return this.helpers.throwDataPersistenceError(error)
    }
  }

  async delete(theme: Theme): Promise<void> {
    try {
      const expectedUpdatedAt = this.requireExpectedUpdatedAt(theme.id.value)

      const affected = await this.table<ThemeDatabaseSchema>()
        .where({ id: theme.id.value, updatedAt: expectedUpdatedAt.value })
        .delete()
      if (affected.length === 0) throw new ConcurrencyError<Theme>(`Theme ${theme.id} was modified by another user`, theme)
    } catch (error: unknown) {
      return this.helpers.throwDataPersistenceError(error)
    }
  }

  private async findByIdRAW(id: string): Promise<ThemeDatabaseSchema | null> {
    return await this.table<ThemeDatabaseSchema>().select('*').where('id', id).first()
  }
}
