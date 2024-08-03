export interface ThemeDatabaseSchema {
  id: string
  name: string
  lightColors: {
    primary: string
    backgroundPrimary: string
    backgroundSecondary: string
    callToAction: string
  }
  darkColors: {
    primary: string
    backgroundPrimary: string
    backgroundSecondary: string
    callToAction: string
  }
  createdById: string
  createdAt: number
  updatedAt: number
}
