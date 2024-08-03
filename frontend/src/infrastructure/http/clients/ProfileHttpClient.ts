import { FetchOptions, ProfileResponse } from '@hatsuportal/contracts'
import { IHttpClient, IProfileHttpClient } from 'application/interfaces'

export class ProfileHttpClient implements IProfileHttpClient {
  private readonly baseUrl = '/users/me/profile'
  constructor(private readonly httpClient: IHttpClient) {}

  async getProfile(options?: FetchOptions): Promise<ProfileResponse> {
    return await this.httpClient.getJson<ProfileResponse>({ endpoint: this.baseUrl, ...options })
  }
}
