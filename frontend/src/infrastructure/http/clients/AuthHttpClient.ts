import { LoginRequest, UserResponse } from '@hatsuportal/contracts'
import { IAuthHttpClient, IHttpClient } from 'application/interfaces'

export class AuthHttpClient implements IAuthHttpClient {
  private readonly baseUrl = '/auth'
  constructor(private readonly httpClient: IHttpClient) {}

  login = async (loginPayload: { username: string; password: string }): Promise<UserResponse> => {
    return await this.httpClient.postJson<UserResponse, LoginRequest>({
      endpoint: `${this.baseUrl}/login`,
      payload: loginPayload,
      noRefresh: true
    })
  }

  logout = async (): Promise<void> => {
    return await this.httpClient.postJson({ endpoint: `${this.baseUrl}/logout` })
  }

  status = async (): Promise<UserResponse> => {
    return await this.httpClient.getJson<UserResponse>({ endpoint: `${this.baseUrl}/status` })
  }
}
