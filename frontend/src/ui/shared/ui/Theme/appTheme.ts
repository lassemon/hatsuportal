import '@mui/material/styles'

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

export {}
