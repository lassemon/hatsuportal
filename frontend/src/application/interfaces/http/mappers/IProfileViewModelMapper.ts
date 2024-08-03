import { ProfileResponse } from '@hatsuportal/contracts'
import { ProfileViewModel } from 'ui/entities/user/model/ProfileViewModel'

export interface IProfileViewModelMapper {
  toViewModel(response: ProfileResponse): ProfileViewModel
}
