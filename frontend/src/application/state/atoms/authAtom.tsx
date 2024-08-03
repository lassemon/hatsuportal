import { StoryPresentation, UserPresentationDTO } from '@hatsuportal/presentation'
import { atomWithAsyncStorage } from './atomWithAsyncStorage'

export interface IAuthState {
  user?: UserPresentationDTO
  loggedIn: boolean
}
export type StoryAtom = StoryPresentation
export interface Success {
  message: string
}

export const authAtom = atomWithAsyncStorage<IAuthState>('authState', { loggedIn: false })
