import { castToEnum, ColorSchemeEnum } from '@hatsuportal/common'
import { ThemeColors } from '@hatsuportal/contracts'
import { atom } from 'jotai'
import { useSetAtom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import { parseThemeCache } from './parseThemeCache'

const localStorageColorSchemeWriteAtom = atomWithStorage<`${ColorSchemeEnum}`>(
  'localStorageColorSchemeAtom',
  ColorSchemeEnum.Light,
  {
    getItem: (key, initialValue) => {
      const storedColorScheme = castToEnum(localStorage.getItem(key), ColorSchemeEnum, ColorSchemeEnum.Light)
      return storedColorScheme || initialValue
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

const localStorageThemeWriteAtom = atomWithStorage<ThemeColors | null>(
  'localStorageThemeAtom',
  null,
  {
    getItem: (key, initialValue) => parseThemeCache(localStorage.getItem(key)) ?? initialValue,
    setItem: (key, newValue) => {
      if (newValue === null) {
        localStorage.removeItem(key)
      } else {
        localStorage.setItem(key, JSON.stringify(newValue))
      }
    },
    removeItem: (key) => {
      localStorage.removeItem(key)
    }
  },
  { getOnInit: true }
)

/** Read-only. useSetAtom on this atom does not persist. */
export const localStorageColorSchemeAtom = atom((get) => get(localStorageColorSchemeWriteAtom))

export type ThemeCache = ThemeColors

/** Read-only. useSetAtom on this atom does not persist. */
export const localStorageThemeAtom = atom((get) => get(localStorageThemeWriteAtom))

export interface ThemePreferencesSetters {
  setColorScheme: (update: `${ColorSchemeEnum}`) => void
  setTheme: (update: ThemeColors) => void
  setColorSchemePreview: (update: `${ColorSchemeEnum}` | null) => void
  setThemePreview: (update: ThemeColors | null) => void
}

/**
 * Sole writer to theme localStorage atoms. In-session SPA navigation may show
 * cached colors until the next bootstrap / login / settings save (intentional).
 */
export function storeTheme(colorScheme: `${ColorSchemeEnum}`, theme: ThemeColors, setters: ThemePreferencesSetters): void {
  setters.setColorScheme(colorScheme)
  setters.setTheme(theme)
  setters.setColorSchemePreview(null)
  setters.setThemePreview(null)
}

export function useThemePreferenceSetters(
  setColorSchemePreview: ThemePreferencesSetters['setColorSchemePreview'],
  setThemePreview: ThemePreferencesSetters['setThemePreview']
): ThemePreferencesSetters {
  const setColorScheme = useSetAtom(localStorageColorSchemeWriteAtom)
  const setTheme = useSetAtom(localStorageThemeWriteAtom)
  return { setColorScheme, setTheme, setColorSchemePreview, setThemePreview }
}
