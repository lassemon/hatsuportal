import { atom } from 'jotai'
import { PreferencesViewModelDTO } from 'ui/entities/user/model/PreferencesViewModel'

export const userPreferencesAtom = atom<PreferencesViewModelDTO | null>(null)
