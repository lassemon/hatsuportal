import { atom } from 'jotai'
import { ThemeColors } from '@hatsuportal/contracts'

export const themePreviewAtom = atom<ThemeColors | null>(null)
