import { ThemeColorsDTO } from '../useCase/ThemeColorsDTO'

export interface ThemeDTO {
  id: string
  name: string
  lightColors: ThemeColorsDTO
  darkColors: ThemeColorsDTO
  createdById: string
  createdAt: number
  updatedAt: number
}
