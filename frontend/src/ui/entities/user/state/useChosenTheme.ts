import { DEFAULT_THEME_COLORS, ThemeColors } from '@hatsuportal/contracts'
import { useAtomValue } from 'jotai'
import { userPreferencesAtom } from 'ui/entities/user/state/userPreferencesAtom'
import { localStorageThemeAtom } from 'ui/shared/state/displayPreferencesAtoms'

export type ChosenTheme = {
  name: string
  colors: ThemeColors
}

export function useChosenTheme(): ChosenTheme {
  const preferences = useAtomValue(userPreferencesAtom)
  const cached = useAtomValue(localStorageThemeAtom)
  if (preferences?.selectedTheme) {
    return {
      name: preferences.selectedTheme.name,
      colors: {
        lightColors: preferences.selectedTheme.lightColors,
        darkColors: preferences.selectedTheme.darkColors
      }
    }
  }
  return {
    name: '', // no identity when only cache/default
    colors: cached ?? DEFAULT_THEME_COLORS
  }
}
