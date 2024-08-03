import { CssBaseline, PaletteMode, ThemeOptions, ThemeProvider, createTheme, darken, lighten } from '@mui/material'
import { useAtom } from 'jotai'
import React from 'react'
import { localStorageColorModeAtom } from 'ui/state/localStorageColorModeAtom'

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

// @ts-ignore
const { palette } = createTheme()

/*
// light theme
const lightPrimary = '#017971'
const lightSecondary = '#01504B'
const lightDefaultBg = '#5F676D'
const lightPaperBg = '#E9EAEC'
const lightCallToAction = '#003d39'

// dark theme
const darkPrimary = '#01504B'
const darkSecondary = '#7DE2D1'
const darkDefaultBg = '#3B3F45'
const darkPaperBg = '#26292C'
const darkCallToAction = '#999AC6'
*/

// light theme
const lightPrimary = '#0C2A28'
const lightSecondary = lighten(lightPrimary, 0.3)
const lightPaperBg = '#FCFCFC'
const lightDefaultBg = darken(lightPaperBg, 0.2)
const lightCallToAction = '#CD5B43'

// dark theme
const darkPrimary = '#F1F3F5'
const darkSecondary = darken(darkPrimary, 0.3)
const darkPaperBg = '#131D29'
const darkDefaultBg = '#21252A'
const darkCallToAction = '#BFFA00'

const getDesignTokens = (mode: PaletteMode): ThemeOptions => ({
  custom: {
    boxShadow: '0.1rem 0 0.2rem #afaba5, -0.1rem 0 0.2rem #afaba5'
  },
  typography: {
    fontFamily: 'Noto Sans, Myriad Pro, Calibri, Helvetica, Arial, sans-serif'
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
            main: '#166938'
          },
          warning: {
            main: '#E9BB3F'
          },
          error: {
            main: '#ff3b5c'
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
            main: '#166938'
          },
          warning: {
            main: '#E9BB3F'
          },
          error: {
            main: '#ff3b5c'
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
  },
  components: {
    // FIX: This is a workaround to prevent the scroll lock from mui modal to stop all page scrolling even when the modal is not open
    // without this, the scroll lock (overflow: hidden) is applied to the body on frontend app start
    // and it prevents the user from scrolling the page
    MuiModal: { defaultProps: { disableScrollLock: true } }
  }
})

const Theme: React.FC = ({ children }) => {
  const [localStorageColorMode] = useAtom(localStorageColorModeAtom)

  const theme = React.useMemo(() => createTheme(getDesignTokens(localStorageColorMode)), [localStorageColorMode])
  console.log(theme)
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline enableColorScheme />
      {children}
    </ThemeProvider>
  )
}

export default Theme
