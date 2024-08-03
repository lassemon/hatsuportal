import { useMemo } from 'react'
import { PaletteMode, Theme } from '@mui/material'
import { ThemeColorsDTO } from 'ui/entities/user/model/ThemeViewModel'
import { useShownTheme } from 'ui/shared/hooks/useShownTheme'
import { createAppTheme } from 'ui/shared/ui/Theme/createAppTheme'

export function useAppTheme(mode: PaletteMode, colors: ThemeColorsDTO): Theme {
  return useMemo(() => createAppTheme(mode, colors), [mode, colors])
}

export function useShownAppTheme(mode: PaletteMode): Theme {
  const shownTheme = useShownTheme()
  const colors = mode === 'light' ? shownTheme.lightColors : shownTheme.darkColors
  return useAppTheme(mode, colors)
}
