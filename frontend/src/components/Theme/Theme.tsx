import { castToEnum } from '@hatsuportal/common'
import { CssBaseline, PaletteMode, ThemeOptions, ThemeProvider, createTheme } from '@mui/material'
import { useAtom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import React from 'react'

export enum ColorMode {
  LIGHT = 'light',
  DARK = 'dark'
}

export const localStorageColorModeAtom = atomWithStorage<`${ColorMode}`>(
  'localStorageColorModeAtom',
  ColorMode.DARK,
  {
    getItem: (key, initialValue) => {
      const storedViewMode = castToEnum(localStorage.getItem(key), ColorMode, ColorMode.DARK)
      return storedViewMode || initialValue
    },
    setItem: (key, newValue) => {
      if (newValue === null) {
        localStorage.removeItem(key)
      } else {
        localStorage.setItem(key, newValue)
      }
    },
    removeItem: (key) => {
      localStorage.removeItem(key)
    }
  },
  { getOnInit: true }
)

declare module '@mui/material/styles' {
  interface Theme {
    custom: {
      boxShadow: string
    }
  }
  interface ThemeOptions {
    custom: {
      boxShadow: string
    }
  }
}

const { palette } = createTheme()

// light theme
const lightPrimary = '#017971'
const lightSecondary = '#01504B'
const lightDefaultBg = '#5F676D'
const lightPaperBg = '#E9EAEC'
const lightCallToAction = '#3B3B58'

// dark theme
const darkPrimary = '#01504B'
const darkSecondary = '#7DE2D1'
const darkDefaultBg = '#3B3F45'
const darkPaperBg = '#26292C'
const darkCallToAction = '#999AC6'

const getDesignTokens = (mode: PaletteMode): ThemeOptions => ({
  custom: {
    boxShadow: '0.1rem 0 0.2rem #afaba5, -0.1rem 0 0.2rem #afaba5'
  },
  palette: {
    mode,
    ...(mode === 'light'
      ? {
          // palette values for light mode
          primary: {
            main: lightPrimary
          },
          secondary: {
            main: lightSecondary
          },
          success: {
            main: '#014F24'
          },
          info: {
            main: lightCallToAction
          },
          action: {
            active: lightCallToAction
          },
          background: {
            default: lightDefaultBg,
            paper: lightPaperBg
          }
        }
      : {
          // palette values for dark mode
          primary: {
            main: darkPrimary
          },
          secondary: {
            main: darkSecondary
          },
          success: {
            main: '#014F24'
          },
          info: {
            main: darkCallToAction
          },
          action: {
            active: darkCallToAction
          },
          background: {
            default: darkDefaultBg,
            paper: darkPaperBg
          }
        })
  }
})

const Theme: React.FC = ({ children }) => {
  const [localStorageColorMode] = useAtom(localStorageColorModeAtom)

  const theme = React.useMemo(() => createTheme(getDesignTokens(localStorageColorMode)), [localStorageColorMode])
  console.log(theme)
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  )
}

export default Theme
