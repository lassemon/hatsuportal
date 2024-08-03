import { FetchOptions } from '@hatsuportal/contracts'
import { ProfileViewModel } from 'ui/entities/user/model/ProfileViewModel'

export interface IProfileService {
  getProfile: (options?: FetchOptions) => Promise<ProfileViewModel>
}
