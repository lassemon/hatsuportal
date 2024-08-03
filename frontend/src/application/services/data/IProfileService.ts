import { ProfilePresentation } from '@hatsuportal/presentation-user'
import { FetchOptions } from '@hatsuportal/presentation-common'

export interface IProfileService {
  getProfile: (options?: FetchOptions) => Promise<ProfilePresentation>
}
