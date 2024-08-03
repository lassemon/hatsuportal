import { ThemeColors } from '@hatsuportal/contracts'
import { PaletteMode, ThemeOptions } from '@mui/material'
import { mapThemeColorsToPalette } from './mapThemeColorsToPalette'
import config from 'config'

const headingScale = 0.7

export const getDesignTokens = (mode: PaletteMode, colors: ThemeColors['lightColors']): ThemeOptions => ({
  custom: {
    boxShadow: '0.1rem 0 0.2rem #afaba5, -0.1rem 0 0.2rem #afaba5'
  },
  typography: {
    fontFamily: 'Be Vietnam Pro, Noto Sans, sans-serif',
    fontSize: 14,
    fontWeightRegular: 500,
    fontWeightMedium: 500,
    h1: {
      fontSize: `${6 * headingScale}rem`
    },
    h2: {
      fontSize: `${3.75 * headingScale}rem`
    },
    h3: {
      fontSize: `${3 * headingScale}rem`
    },
    h4: {
      fontSize: `${2.125 * headingScale}rem`
    },
    h5: {
      fontSize: `${1.5 * headingScale}rem`
    },
    h6: {
      fontSize: `${1.25 * headingScale}rem`
    },
    button: {
      textTransform: 'none'
    }
  },
  palette: mapThemeColorsToPalette(mode, colors),
  components: {
    MuiModal: { defaultProps: { disableScrollLock: true } },
    MuiPopover: { defaultProps: { disableScrollLock: true } },
    MuiPaper: { defaultProps: { square: true, elevation: 0 } },
    MuiTypography: { defaultProps: { maxWidth: config.textColumnMaxWidth } },
    MuiButton: { defaultProps: { disableElevation: true }, styleOverrides: { root: { textTransform: 'none' } } }
  }
})
