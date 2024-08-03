import { ThemeColorsRequest } from './ThemeColorsRequest'

export interface CreateThemeRequest {
  name: string
  lightColors: ThemeColorsRequest
  darkColors: ThemeColorsRequest
}
