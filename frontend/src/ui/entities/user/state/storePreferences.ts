import { storeTheme, ThemePreferencesSetters, useThemePreferenceSetters } from 'ui/shared/state/displayPreferencesAtoms'
import { PreferencesViewModel, PreferencesViewModelDTO } from 'ui/entities/user/model/PreferencesViewModel'
import { IPreferencesService } from 'application/interfaces'
import { useSetAtom } from 'jotai'
import { userPreferencesAtom } from 'ui/entities/user/state/userPreferencesAtom'
import { colorSchemePreviewAtom } from 'ui/shared/state/colorSchemePreviewAtom'
import { themePreviewAtom } from 'ui/shared/state/themePreviewAtom'
import { FetchOptions } from '../../../../../../packages/contracts/src/common/FetchOptions'
import { ColorSchemeEnum } from '@hatsuportal/common'

/**
 * Preferences flow:
 * 1. fetchAndStorePreferences — bootstrap, login, settings retry
 * 2. storePreferences — after settings save (API already returned prefs)
 * 3. colorSchemePreviewAtom — ephemeral UI only; cleared by storeTheme on store
 *
 * Reads:  userPreferencesAtom (app logic), localStorage* atoms (Theme rendering)
 * Writes: always go through storePreferences / fetchAndStorePreferences
 */

export interface PreferencesSetters extends ThemePreferencesSetters {
  setUserPreferences: (update: PreferencesViewModelDTO | null) => void
}

/**
 * Write server preferences to all client stores
 */
export function storePreferences(preferences: PreferencesViewModel, setters: PreferencesSetters): void {
  setters.setUserPreferences(preferences.toJSON())
  storeTheme(preferences.colorScheme, preferences.selectedTheme.toJSON(), setters)
}

export async function fetchAndStorePreferences(preferencesService: IPreferencesService, setters: PreferencesSetters): Promise<void> {
  const preferences = await preferencesService.getPreferences()
  storePreferences(preferences, setters)
}

export async function applySelectedTheme(
  themeId: string,
  preferencesService: IPreferencesService,
  setters: PreferencesSetters,
  options?: FetchOptions
): Promise<PreferencesViewModel> {
  const preferences = await preferencesService.updatePreferences({ selectedThemeId: themeId }, options)
  storePreferences(preferences, setters)
  return preferences
}

export async function applyColorScheme(
  colorScheme: `${ColorSchemeEnum}`,
  preferencesService: IPreferencesService,
  setters: PreferencesSetters,
  options?: FetchOptions
): Promise<PreferencesViewModel> {
  const preferences = await preferencesService.updatePreferences({ colorScheme }, options)
  storePreferences(preferences, setters)
  return preferences
}

export function usePreferenceSetters(): PreferencesSetters {
  const setUserPreferences = useSetAtom(userPreferencesAtom)
  const setColorSchemePreview = useSetAtom(colorSchemePreviewAtom)
  const setThemePreview = useSetAtom(themePreviewAtom)
  const themeSetters = useThemePreferenceSetters(setColorSchemePreview, setThemePreview)
  return { setUserPreferences, ...themeSetters }
}
