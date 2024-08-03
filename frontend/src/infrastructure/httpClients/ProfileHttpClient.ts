import { ProfileResponse } from '@hatsuportal/presentation-user'
import { FetchOptions } from '@hatsuportal/presentation-common'
import { IHttpClient, IProfileHttpClient } from 'application'

export class ProfileHttpClient implements IProfileHttpClient {
  constructor(private readonly httpClient: IHttpClient) {}

  async getProfile(options?: FetchOptions): Promise<ProfileResponse> {
    return await this.httpClient.getJson<ProfileResponse>({ ...{ endpoint: '/profile' }, ...options })
  }
}
