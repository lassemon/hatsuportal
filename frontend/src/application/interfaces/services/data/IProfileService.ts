import { FetchOptions } from '@hatsuportal/contracts'
import { ProfileViewModel } from 'ui/features/user/viewModels/ProfileViewModel'

export interface IProfileService {
  getProfile: (options?: FetchOptions) => Promise<ProfileViewModel>
}
