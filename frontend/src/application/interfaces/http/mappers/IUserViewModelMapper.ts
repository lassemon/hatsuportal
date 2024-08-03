import { UserResponse } from '@hatsuportal/contracts'
import { UserViewModel } from 'ui/entities/user/model/UserViewModel'

export interface IUserViewModelMapper {
  toViewModel(response: UserResponse): UserViewModel
}
