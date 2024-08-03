import { FetchOptions, ProfileResponse } from '@hatsuportal/contracts'
import { IHttpClient, IProfileHttpClient } from 'application/interfaces'

export class ProfileHttpClient implements IProfileHttpClient {
  constructor(private readonly httpClient: IHttpClient) {}

  async getProfile(options?: FetchOptions): Promise<ProfileResponse> {
    return await this.httpClient.getJson<ProfileResponse>({ ...{ endpoint: '/profile' }, ...options })
  }
}
