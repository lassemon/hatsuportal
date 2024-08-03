import { UserViewModel } from 'ui/entities/user/model/UserViewModel'

export interface IAuthService {
  login(loginPayload: { username: string; password: string }): Promise<UserViewModel>
  logout(): Promise<void>
  status(): Promise<UserViewModel>
}
