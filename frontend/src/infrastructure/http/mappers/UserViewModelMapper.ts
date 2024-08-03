import { UserResponse } from '@hatsuportal/contracts'
import { UserViewModel } from 'ui/features/user/viewModels/UserViewModel'
import { IUserViewModelMapper } from 'application/interfaces'
import { UserRoleEnum, validateAndCastEnum } from '@hatsuportal/common'

export class UserViewModelMapper implements IUserViewModelMapper {
  public toViewModel(response: UserResponse): UserViewModel {
    return new UserViewModel({
      id: response.id,
      name: response.name,
      email: response.email,
      roles: response.roles.map((role) => validateAndCastEnum(role, UserRoleEnum)),
      createdAt: response.createdAt,
      updatedAt: response.updatedAt
    })
  }
}
