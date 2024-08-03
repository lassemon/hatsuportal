import { UserPresentationDTO } from '@hatsuportal/presentation-user'
import { atomWithAsyncStorage } from './atomWithAsyncStorage'

export interface IAuthState {
  user?: UserPresentationDTO
  loggedIn: boolean
}
export interface Success {
  message: string
}

export const authAtom = atomWithAsyncStorage<IAuthState>('authState', { loggedIn: false })
