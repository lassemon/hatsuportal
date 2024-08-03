import { ThemeColorsRequest } from './ThemeColorsRequest'

export interface UpdateThemeRequest {
  name?: string
  lightColors?: ThemeColorsRequest
  darkColors?: ThemeColorsRequest
}
