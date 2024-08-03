import { atom } from 'jotai'

export interface Success {
  message: string
}

export const successAtom = atom<Success | null>(null)
