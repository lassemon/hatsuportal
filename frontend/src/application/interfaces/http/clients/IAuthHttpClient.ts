import { UserResponse } from '@hatsuportal/contracts'

export interface IAuthHttpClient {
  login(loginPayload: { username: string; password: string }): Promise<UserResponse>
  logout(): Promise<void>
  status(): Promise<UserResponse>
}
