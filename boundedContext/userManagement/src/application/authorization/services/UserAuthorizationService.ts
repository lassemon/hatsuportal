import { IAuthorizationDecision, IUserForAuthorization, AuthorizationServiceBase } from '@hatsuportal/platform'
import { UserRoleEnum } from '@hatsuportal/common'
import { UserAction, UserAuthorizationPayloadMap } from '../rules/user.rules'
import { UserDTO } from '../../dtos'

export interface IUserAuthorizationService {
  canCreateUser(user: IUserForAuthorization, newUsersRoles: UserRoleEnum[]): IAuthorizationDecision
  canUpdateUser(user: IUserForAuthorization, userToUpdate: UserDTO): IAuthorizationDecision
  canDeactivateUser(user: IUserForAuthorization): IAuthorizationDecision
  canViewUser(user: IUserForAuthorization, userToView: UserDTO): IAuthorizationDecision
  canListAllUsers(user: IUserForAuthorization): IAuthorizationDecision
}

export class UserAuthorizationService
  extends AuthorizationServiceBase<UserAction, UserAuthorizationPayloadMap>
  implements IUserAuthorizationService
{
  canCreateUser(user: IUserForAuthorization, newUsersRoles: UserRoleEnum[]) {
    return this.authorize(UserAction.Create, user, { newUsersRoles })
  }

  canUpdateUser(user: IUserForAuthorization, userToUpdate: UserDTO) {
    return this.authorize(UserAction.Update, user, { user: userToUpdate })
  }

  canDeactivateUser(user: IUserForAuthorization) {
    return this.authorize(UserAction.Deactivate, user)
  }

  canViewUser(user: IUserForAuthorization, userToView: UserDTO) {
    return this.authorize(UserAction.View, user, { user: userToView })
  }

  canListAllUsers(user: IUserForAuthorization) {
    return this.authorize(UserAction.ListAll, user)
  }
}
