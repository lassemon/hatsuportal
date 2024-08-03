import { FetchOptions } from '@hatsuportal/contracts'
import { IProfileHttpClient, IProfileService, IProfileViewModelMapper } from 'application/interfaces'
import { ProfileViewModel } from 'ui/features/user/viewModels/ProfileViewModel'

export class ProfileService implements IProfileService {
  constructor(private readonly profileHttpClient: IProfileHttpClient, private readonly profileViewModelMapper: IProfileViewModelMapper) {}

  public async getProfile(options?: FetchOptions): Promise<ProfileViewModel> {
    const response = await this.profileHttpClient.getProfile(options)
    return this.profileViewModelMapper.toViewModel(response)
  }
}
