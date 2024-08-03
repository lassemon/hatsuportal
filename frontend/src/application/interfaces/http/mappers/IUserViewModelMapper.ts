import { UserResponse } from '@hatsuportal/contracts'
import { UserViewModel } from 'ui/features/user/viewModels/UserViewModel'

export interface IUserViewModelMapper {
  toViewModel(response: UserResponse): UserViewModel
}
