import { atom } from 'jotai'
import { ColorSchemeEnum } from '@hatsuportal/common'

export const colorSchemePreviewAtom = atom<`${ColorSchemeEnum}` | null>(null)
