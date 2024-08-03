import { ThemeColorsDTO } from './ThemeColorsDTO'

export interface UpdateThemeInputDTO {
  name?: string
  lightColors?: ThemeColorsDTO
  darkColors?: ThemeColorsDTO
}
