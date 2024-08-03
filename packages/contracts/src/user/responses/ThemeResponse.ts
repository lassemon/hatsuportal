export interface ThemeColorsResponse {
  primary: string
  backgroundPrimary: string
  backgroundSecondary: string
  callToAction: string
}

export interface ThemeResponse {
  id: string
  name: string
  lightColors: ThemeColorsResponse
  darkColors: ThemeColorsResponse
  createdById: string
  createdAt: number
  updatedAt: number
}

export type ThemeListResponse = ThemeResponse[]
