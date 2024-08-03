import { colorSchemePreviewAtom } from '../state/colorSchemePreviewAtom'
import { useAtomValue } from 'jotai'
import { localStorageColorSchemeAtom } from '../state/displayPreferencesAtoms'
import { ColorSchemeEnum } from '@hatsuportal/common'

export const useColorScheme = (): `${ColorSchemeEnum}` => {
  const previewColorMode = useAtomValue(colorSchemePreviewAtom)
  const persistedColorMode = useAtomValue(localStorageColorSchemeAtom)
  return previewColorMode ?? persistedColorMode ?? ColorSchemeEnum.Light
}
