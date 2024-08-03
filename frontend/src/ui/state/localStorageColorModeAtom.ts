import { castToEnum } from '@hatsuportal/common'
import { atomWithStorage } from 'jotai/utils'

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
