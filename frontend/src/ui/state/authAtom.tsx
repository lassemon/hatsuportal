import { UserViewModelDTO } from 'ui/features/user/viewModels/UserViewModel'
import { atomWithAsyncStorage } from './atomWithAsyncStorage'

export interface AuthStateDTO {
  user?: UserViewModelDTO
  loggedIn: boolean
}
export interface Success {
  message: string
}

export const authAtom = atomWithAsyncStorage<AuthStateDTO>('authState', { loggedIn: false })
