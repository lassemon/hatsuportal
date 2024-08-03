import { FetchOptions, ProfileResponse } from '@hatsuportal/contracts'

export interface IProfileHttpClient {
  getProfile: (options?: FetchOptions) => Promise<ProfileResponse>
}
