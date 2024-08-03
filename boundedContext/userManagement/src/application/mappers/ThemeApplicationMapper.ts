import { Theme } from '../../domain'
import { ThemeDTO } from '../dtos/theme/ThemeDTO'

export interface IThemeApplicationMapper {
  toDTO(theme: Theme): ThemeDTO
}

export class ThemeApplicationMapper implements IThemeApplicationMapper {
  toDTO(theme: Theme): ThemeDTO {
    return {
      id: theme.id.value,
      name: theme.name.value,
      lightColors: theme.lightColors.serialize(),
      darkColors: theme.darkColors.serialize(),
      createdById: theme.createdById.value,
      createdAt: theme.createdAt.value,
      updatedAt: theme.updatedAt.value
    }
  }
}
