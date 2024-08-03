import { FetchOptions, ProfilePresentation } from '@hatsuportal/presentation'

export interface IProfileService {
  getProfile: (options?: FetchOptions) => Promise<ProfilePresentation>
}
