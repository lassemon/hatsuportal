import { ProfileResponse } from '@hatsuportal/presentation-user'
import { FetchOptions } from '@hatsuportal/presentation-common'

export interface IProfileHttpClient {
  getProfile: (options?: FetchOptions) => Promise<ProfileResponse>
}
