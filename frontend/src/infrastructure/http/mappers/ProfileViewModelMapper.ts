import { ProfileResponse } from '@hatsuportal/contracts'
import { ProfileViewModel } from 'ui/entities/user/model/ProfileViewModel'
import { IProfileViewModelMapper } from 'application/interfaces'

export class ProfileViewModelMapper implements IProfileViewModelMapper {
  toViewModel(profileResponse: ProfileResponse): ProfileViewModel {
    return new ProfileViewModel(profileResponse)
  }
}
