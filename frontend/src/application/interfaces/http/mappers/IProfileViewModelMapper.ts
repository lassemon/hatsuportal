import { ProfileResponse } from '@hatsuportal/contracts'
import { ProfileViewModel } from 'ui/features/user/viewModels/ProfileViewModel'

export interface IProfileViewModelMapper {
  toViewModel(response: ProfileResponse): ProfileViewModel
}
