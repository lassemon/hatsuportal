import { UserViewModel } from 'ui/features/user/viewModels/UserViewModel'

export interface IAuthService {
  login(loginPayload: { username: string; password: string }): Promise<UserViewModel>
  logout(): Promise<void>
  status(): Promise<UserViewModel>
}
