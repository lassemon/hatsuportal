import { ProfileResponse } from '@hatsuportal/contracts'
import { ProfileViewModel } from 'ui/features/user/viewModels/ProfileViewModel'
import { IProfileViewModelMapper } from 'application/interfaces'

export class ProfileViewModelMapper implements IProfileViewModelMapper {
  toViewModel(response: ProfileResponse): ProfileViewModel {
    return new ProfileViewModel(response)
  }
}
