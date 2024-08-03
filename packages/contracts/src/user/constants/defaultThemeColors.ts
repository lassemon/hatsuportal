import { ThemeColorsResponse } from '../responses/ThemeResponse'

/** Any theme's display palette (Default or custom) */
export interface ThemeColors {
  lightColors: ThemeColorsResponse
  darkColors: ThemeColorsResponse
}

/** Canonical Default theme palette — must match backend/seeds/001_bootstrap.sql */
export const DEFAULT_THEME_COLORS: ThemeColors = {
  lightColors: {
    primary: '#0C2A28',
    backgroundPrimary: '#F5F5F5',
    backgroundSecondary: '#EDE6D6',
    callToAction: '#CD5B43'
  },
  darkColors: {
    primary: '#F1F3F5',
    backgroundPrimary: '#21252A',
    backgroundSecondary: '#131D29',
    callToAction: '#BFFA00'
  }
}
