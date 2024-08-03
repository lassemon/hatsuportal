import { useAtomValue } from 'jotai'
import { DEFAULT_THEME_COLORS, ThemeColors } from '@hatsuportal/contracts'
import { localStorageThemeAtom } from '../state/displayPreferencesAtoms'
import { themePreviewAtom } from '../state/themePreviewAtom'

export function useShownTheme(): ThemeColors {
  const preview = useAtomValue(themePreviewAtom)
  const persisted = useAtomValue(localStorageThemeAtom)
  return preview ?? persisted ?? DEFAULT_THEME_COLORS
}
