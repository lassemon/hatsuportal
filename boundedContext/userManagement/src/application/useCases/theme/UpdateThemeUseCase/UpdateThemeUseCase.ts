import { ConcurrencyError, IUnitOfWork, IUseCase, IUseCaseOptions, NotFoundError } from '@hatsuportal/platform'
import { isUndefined } from 'lodash'
import { IThemeRepository, Theme, ThemeColors, ThemeId, ThemeName } from '../../../../domain'
import { ThemeDTO, UpdateThemeInputDTO } from '../../../dtos'
import { IThemeApplicationMapper } from '../../../mappers/ThemeApplicationMapper'

export interface IUpdateThemeUseCaseOptions extends IUseCaseOptions {
  updatedById: string
  themeId: string
  updateThemeInput: UpdateThemeInputDTO
  themeUpdated: (theme: ThemeDTO) => void
  updateConflict: (error: ConcurrencyError<Theme>) => void
}

export type IUpdateThemeUseCase = IUseCase<IUpdateThemeUseCaseOptions>

export class UpdateThemeUseCase implements IUpdateThemeUseCase {
  constructor(
    private readonly themeRepository: IThemeRepository,
    private readonly themeApplicationMapper: IThemeApplicationMapper,
    private readonly unitOfWork: IUnitOfWork
  ) {}

  async execute({ themeId, updateThemeInput, themeUpdated, updateConflict }: IUpdateThemeUseCaseOptions): Promise<void> {
    try {
      const [updatedTheme] = await this.unitOfWork.execute<[Theme]>(async () => {
        const existingTheme = await this.themeRepository.findByIdForUpdate(new ThemeId(themeId))
        if (!existingTheme) {
          throw new NotFoundError(`Theme with id ${themeId} not found`)
        }

        const theme = existingTheme.clone()
        const { name, lightColors, darkColors } = updateThemeInput

        if (!isUndefined(name)) {
          theme.rename(new ThemeName(name))
        }
        if (!isUndefined(lightColors)) {
          theme.updateLightColors(ThemeColors.reconstruct(lightColors))
        }
        if (!isUndefined(darkColors)) {
          theme.updateDarkColors(ThemeColors.reconstruct(darkColors))
        }

        await this.themeRepository.update(theme)
        return [theme]
      })

      themeUpdated(this.themeApplicationMapper.toDTO(updatedTheme))
    } catch (error) {
      if (error instanceof ConcurrencyError) {
        updateConflict(error)
        return
      }
      throw error
    }
  }
}
