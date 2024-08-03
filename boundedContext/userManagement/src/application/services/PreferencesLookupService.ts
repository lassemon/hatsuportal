import { NotFoundError } from '@hatsuportal/platform'
import { DefaultThemeId, IThemeRepository, ThemeId, UserId } from '../../domain'
import { PreferencesDTO, PreferencesDTOWithTheme } from '../dtos'
import { IUserApplicationMapper } from '../mappers/UserApplicationMapper'
import { IThemeApplicationMapper } from '../mappers/ThemeApplicationMapper'
import { IUserReadRepository } from '../read/IUserReadRepository'

export interface IPreferencesLookupService {
  findByUserId(userId: UserId): Promise<PreferencesDTOWithTheme | null>
  invalidateByUserId(userId: UserId): void
}

export class PreferencesLookupService implements IPreferencesLookupService {
  constructor(
    private readonly userReadRepository: IUserReadRepository,
    private readonly userApplicationMapper: IUserApplicationMapper,
    private readonly themeRepository: IThemeRepository,
    private readonly themeMapper: IThemeApplicationMapper
  ) {}

  invalidateByUserId(userId: UserId): void {
    this.userReadRepository.invalidateById(userId)
  }

  async findByUserId(userId: UserId): Promise<PreferencesDTOWithTheme | null> {
    const readModel = await this.userReadRepository.findById(userId)
    if (!readModel) {
      return null
    }

    const base = this.userApplicationMapper.preferencesDTOFromReadModel(readModel)
    return this.enrichOne(base)
  }

  private async enrichOne(base: PreferencesDTO): Promise<PreferencesDTOWithTheme> {
    const theme =
      (await this.themeRepository.findById(new ThemeId(base.selectedThemeId))) ??
      (await this.themeRepository.findById(new DefaultThemeId()))

    if (!theme) {
      throw new NotFoundError('Default theme missing')
    }

    return {
      ...base,
      selectedThemeId: theme.id.value,
      selectedTheme: this.themeMapper.toDTO(theme)
    }
  }
}
