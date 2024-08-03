import { createAbacEngine, IAuthorizationDecision, IAuthorizationEngine, IUserToRequesterMapper } from '@hatsuportal/platform'
import { UserRoleEnum } from '@hatsuportal/common'
import {
  CreateUserAuthorizationAttributes,
  DeactivateUserAuthorizationAttributes,
  ListAllUsersAuthorizationAttributes,
  UpdateUserAuthorizationAttributes,
  UserAction,
  UserResourceType,
  userRules,
  ViewUserAuthorizationAttributes
} from '../rules/user.rules'
import { UserDTO } from '../../dtos'

export interface IUserForAuthorization {
  id: string | null
  roles: UserRoleEnum[]
  active: boolean
}

export interface IUserAuthorizationService {
  canCreateUser(user: IUserForAuthorization): IAuthorizationDecision
  canUpdateUser(user: IUserForAuthorization, userToUpdate: UserDTO): IAuthorizationDecision
  canDeactivateUser(user: IUserForAuthorization): IAuthorizationDecision
  canViewUser(user: IUserForAuthorization, userToView: UserDTO): IAuthorizationDecision
  canListAllUsers(user: IUserForAuthorization): IAuthorizationDecision
}

export class UserAuthorizationService implements IUserAuthorizationService {
  private readonly userAbacEngine: IAuthorizationEngine
  constructor(private readonly requesterMapper: IUserToRequesterMapper) {
    this.userAbacEngine = createAbacEngine(userRules)
  }

  canCreateUser(user: IUserForAuthorization): IAuthorizationDecision {
    return this.userAbacEngine.evaluate<CreateUserAuthorizationAttributes>({
      requester: this.requesterMapper.fromSession(user),
      action: UserAction.Create,
      resource: { type: UserResourceType.User }
    })
  }

  canUpdateUser(user: IUserForAuthorization, userToUpdate: UserDTO): IAuthorizationDecision {
    return this.userAbacEngine.evaluate<UpdateUserAuthorizationAttributes>({
      requester: this.requesterMapper.fromSession(user),
      action: UserAction.Update,
      resource: { type: UserResourceType.User, id: userToUpdate.id.toString(), attributes: { user: userToUpdate } }
    })
  }

  canDeactivateUser(user: IUserForAuthorization): IAuthorizationDecision {
    return this.userAbacEngine.evaluate<DeactivateUserAuthorizationAttributes>({
      requester: this.requesterMapper.fromSession(user),
      action: UserAction.Deactivate,
      resource: { type: UserResourceType.User }
    })
  }

  canViewUser(user: IUserForAuthorization, userToView: UserDTO): IAuthorizationDecision {
    return this.userAbacEngine.evaluate<ViewUserAuthorizationAttributes>({
      requester: this.requesterMapper.fromSession(user),
      action: UserAction.View,
      resource: { type: UserResourceType.User, id: userToView.id.toString(), attributes: { user: userToView } }
    })
  }

  canListAllUsers(user: IUserForAuthorization): IAuthorizationDecision {
    return this.userAbacEngine.evaluate<ListAllUsersAuthorizationAttributes>({
      requester: this.requesterMapper.fromSession(user),
      action: UserAction.ListAll,
      resource: { type: UserResourceType.User }
    })
  }
}
