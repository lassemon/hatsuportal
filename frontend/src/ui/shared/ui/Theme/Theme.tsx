import { CssBaseline, ThemeProvider } from '@mui/material'
import React from 'react'
import { ColorSchemeEnum } from '@hatsuportal/common'
import { useColorScheme } from 'ui/shared/hooks/useColorScheme'
import { useShownTheme } from 'ui/shared/hooks/useShownTheme'
import { createAppTheme } from './createAppTheme'

const Theme: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const selectedColorScheme = useColorScheme()
  const shownTheme = useShownTheme()
  const schemeColors = selectedColorScheme === ColorSchemeEnum.Light ? shownTheme.lightColors : shownTheme.darkColors

  const theme = React.useMemo(() => createAppTheme(selectedColorScheme, schemeColors), [selectedColorScheme, schemeColors])

  console.log(theme)

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline enableColorScheme />
      {children}
    </ThemeProvider>
  )
}

export default Theme
