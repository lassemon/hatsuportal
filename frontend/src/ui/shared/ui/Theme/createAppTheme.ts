import './appTheme'
import { createTheme, PaletteMode, Theme } from '@mui/material'
import { ThemeColorsResponse } from '@hatsuportal/contracts'
import { getDesignTokens } from './getDesignTokens'

export function createAppTheme(mode: PaletteMode, colors: ThemeColorsResponse): Theme {
  return createTheme(getDesignTokens(mode, colors))
}
