import { PaletteMode, ThemeOptions, darken, lighten } from '@mui/material'
import { ThemeColorsResponse } from '@hatsuportal/contracts'
import tinycolor from 'tinycolor2'

function toMuiColor(value: string): string {
  return tinycolor(value).toHexString().toUpperCase()
}

export function mapThemeColorsToPalette(mode: PaletteMode, colors: ThemeColorsResponse): ThemeOptions['palette'] {
  const primaryForMui = toMuiColor(colors.primary)
  const backgroundPrimaryForMui = toMuiColor(colors.backgroundPrimary)
  const backgroundSecondaryForMui = toMuiColor(colors.backgroundSecondary)
  const callToActionForMui = toMuiColor(colors.callToAction)

  const secondaryForMui = mode === 'light' ? lighten(primaryForMui, 0.3) : darken(primaryForMui, 0.3)

  return {
    mode,
    primary: {
      main: primaryForMui
    },
    secondary: {
      main: secondaryForMui
    },
    success: {
      main: '#166938'
    },
    warning: {
      main: '#E9BB3F'
    },
    error: {
      main: '#ff3b5c'
    },
    info: {
      main: callToActionForMui,
      dark: darken(callToActionForMui, 0.3),
      light: lighten(callToActionForMui, 0.3)
    },
    action: {
      active: callToActionForMui
    },
    background: {
      default: backgroundSecondaryForMui,
      paper: backgroundPrimaryForMui
    }
  }
}
