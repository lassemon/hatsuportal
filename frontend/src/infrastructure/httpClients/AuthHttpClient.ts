import { LoginRequest, UserResponse } from '@hatsuportal/presentation-user'
import { IAuthHttpClient, IHttpClient } from 'application'

export class AuthHttpClient implements IAuthHttpClient {
  constructor(private readonly httpClient: IHttpClient) {}

  login = async (loginPayload: { username: string; password: string }): Promise<UserResponse> => {
    return await this.httpClient.postJson<UserResponse, LoginRequest>({
      endpoint: '/auth/login',
      payload: loginPayload,
      noRefresh: true
    })
  }

  logout = async (): Promise<void> => {
    return await this.httpClient.postJson({ endpoint: '/auth/logout' })
  }

  status = async (): Promise<UserResponse> => {
    return await this.httpClient.getJson<UserResponse>({ endpoint: '/auth/status' })
  }
}
