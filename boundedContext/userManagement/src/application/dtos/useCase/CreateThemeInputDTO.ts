import { ThemeColorsDTO } from './ThemeColorsDTO'

export interface CreateThemeInputDTO {
  name: string
  lightColors: ThemeColorsDTO
  darkColors: ThemeColorsDTO
}
