import { FetchOptions, ProfileResponse } from '@hatsuportal/presentation'

export interface IProfileHttpClient {
  getProfile: (options?: FetchOptions) => Promise<ProfileResponse>
}
