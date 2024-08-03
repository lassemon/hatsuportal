import { UserPresentation } from '@hatsuportal/presentation-user'

export interface IAuthService {
  login(loginPayload: { username: string; password: string }): Promise<UserPresentation>
  logout(): Promise<void>
  status(): Promise<UserPresentation>
}
