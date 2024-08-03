import { UserViewModelDTO } from 'ui/entities/user/model/UserViewModel'
import { atomWithAsyncStorage } from 'ui/shared/lib/atomWithAsyncStorage'

export interface AuthStateDTO {
  user?: UserViewModelDTO
  loggedIn: boolean
}
export interface Success {
  message: string
}

export const authAtom = atomWithAsyncStorage<AuthStateDTO>('authState', { loggedIn: false })
