import { UserRoleEnum } from '@hatsuportal/common'
import { defineRule, isActive, isAdmin, isSelf, IRequester, requireLoggedInActive, requesterDisplayName } from '@hatsuportal/platform'
import { UserDTO } from '../../dtos'

export enum UserAction {
  Create = 'user:create',
  Update = 'user:update',
  Deactivate = 'user:deactivate',
  View = 'user:view',
  ListAll = 'user:list-all',
  ViewProfile = 'user:view-profile',
  ViewPreferences = 'user:view-preferences',
  UpdateProfile = 'user:update-profile',
  UpdatePreferences = 'user:update-preferences'
}

export enum UserResourceType {
  User = 'User'
}

export interface CreateUserAuthorizationAttributes {
  newUsersRoles: UserRoleEnum[]
}

export interface UpdateUserAuthorizationAttributes {
  user: UserDTO
}

export interface DeactivateUserAuthorizationAttributes {}

export interface ViewUserAuthorizationAttributes {
  user: UserDTO
}

export interface ListAllUsersAuthorizationAttributes {}

export interface ViewProfileAuthorizationAttributes {
  user: UserDTO
}

export interface ViewPreferencesAuthorizationAttributes {
  user: UserDTO
}

export interface UpdateProfileAuthorizationAttributes {
  user: UserDTO
}

export interface UpdatePreferencesAuthorizationAttributes {
  user: UserDTO
}

const createUserRule = defineRule<CreateUserAuthorizationAttributes>()({
  action: UserAction.Create,
  resourceType: UserResourceType.User,
  condition: (request) => {
    const isNotLoggedInOrActiveDenial = requireLoggedInActive(request)
    if (isNotLoggedInOrActiveDenial) return isNotLoggedInOrActiveDenial
    const requesterName = requesterDisplayName(request)
    if (!isAdmin(request)) {
      return { allowed: false, reason: `User ${requesterName} does not have permission to create a new user.` }
    }
    const creatorIsSuperAdmin = request.requester?.roles.includes(UserRoleEnum.SuperAdmin)
    const creatingAdminUser = request.resource?.attributes?.newUsersRoles.includes(UserRoleEnum.Admin)
    if (creatingAdminUser && !creatorIsSuperAdmin) {
      return {
        allowed: false,
        reason: `User ${requesterName} does not have permission to create a new admin user.`
      }
    }
    return { allowed: true }
  }
})

const updateUserRule = defineRule<UpdateUserAuthorizationAttributes>()({
  action: UserAction.Update,
  resourceType: UserResourceType.User,
  condition: (request) => {
    const isNotLoggedInOrActiveDenial = requireLoggedInActive(request)
    if (isNotLoggedInOrActiveDenial) return isNotLoggedInOrActiveDenial
    if (!isSelf(request) && !isAdmin(request)) {
      return {
        allowed: false,
        reason: `User ${requesterDisplayName(request)} does not have permission to update user ${request.resource?.id}.`
      }
    }
    return { allowed: true }
  }
})

const deactivateUserRule = defineRule<DeactivateUserAuthorizationAttributes>()({
  action: UserAction.Deactivate,
  resourceType: UserResourceType.User,
  condition: (request) => {
    const isNotLoggedInOrActiveDenial = requireLoggedInActive(request)
    if (isNotLoggedInOrActiveDenial) return isNotLoggedInOrActiveDenial
    if (!isAdmin(request)) {
      return {
        allowed: false,
        reason: `User ${requesterDisplayName(request)} does not have permission to deactivate user ${request.resource?.id}.`
      }
    }
    return { allowed: true }
  }
})

const viewUserRule = defineRule<ViewUserAuthorizationAttributes>()({
  action: UserAction.View,
  resourceType: UserResourceType.User,
  condition: (request) => {
    const requesterName = requesterDisplayName(request)
    // inactive users can still see their own profile, admins see everyone
    if (!isActive(request) && !isSelf(request) && !isAdmin(request)) {
      return { allowed: false, reason: `User ${requesterName} is not active.` }
    }
    if (!isSelf(request) && !isAdmin(request)) {
      return {
        allowed: false,
        reason: `User ${requesterName} does not have permission to view user ${request.resource?.id}.`
      }
    }

    return { allowed: true }
  }
})

const listAllUsersRule = defineRule<ListAllUsersAuthorizationAttributes>()({
  action: UserAction.ListAll,
  resourceType: UserResourceType.User,
  condition: (request) => {
    const isNotLoggedInOrActiveDenial = requireLoggedInActive(request)
    if (isNotLoggedInOrActiveDenial) return isNotLoggedInOrActiveDenial
    if (!isAdmin(request)) {
      return {
        allowed: false,
        reason: `User ${requesterDisplayName(request)} does not have permission to list all users.`
      }
    }
    return { allowed: true }
  }
})

const viewProfileRule = defineRule<ViewProfileAuthorizationAttributes>()({
  action: UserAction.ViewProfile,
  resourceType: UserResourceType.User,
  condition: (request) => {
    const requesterName = requesterDisplayName(request)
    if (!isActive(request) && !isSelf(request)) {
      return { allowed: false, reason: `User ${requesterName} is not active.` }
    }
    if (!isSelf(request)) {
      return {
        allowed: false,
        reason: `User ${requesterName} does not have permission to view this profile.`
      }
    }
    return { allowed: true }
  }
})

const viewPreferencesRule = defineRule<ViewPreferencesAuthorizationAttributes>()({
  action: UserAction.ViewPreferences,
  resourceType: UserResourceType.User,
  condition: (request) => {
    const requesterName = requesterDisplayName(request)
    if (!isActive(request) && !isSelf(request)) {
      return { allowed: false, reason: `User ${requesterName} is not active.` }
    }
    if (!isSelf(request)) {
      return {
        allowed: false,
        reason: `User ${requesterName} does not have permission to view this preferences.`
      }
    }
    return { allowed: true }
  }
})

const updateProfileRule = defineRule<UpdateProfileAuthorizationAttributes>()({
  action: UserAction.UpdateProfile,
  resourceType: UserResourceType.User,
  condition: (request) => {
    const isNotLoggedInOrActiveDenial = requireLoggedInActive(request)
    if (isNotLoggedInOrActiveDenial) return isNotLoggedInOrActiveDenial
    if (!isSelf(request)) {
      return {
        allowed: false,
        reason: `User ${requesterDisplayName(request)} does not have permission to update this profile.`
      }
    }
    return { allowed: true }
  }
})

const updatePreferencesRule = defineRule<UpdatePreferencesAuthorizationAttributes>()({
  action: UserAction.UpdatePreferences,
  resourceType: UserResourceType.User,
  condition: (request) => {
    const isNotLoggedInOrActiveDenial = requireLoggedInActive(request)
    if (isNotLoggedInOrActiveDenial) return isNotLoggedInOrActiveDenial
    if (!isSelf(request)) {
      return {
        allowed: false,
        reason: `User ${requesterDisplayName(request)} does not have permission to update this preferences.`
      }
    }
    return { allowed: true }
  }
})

export const userRuleMap = {
  [UserAction.Create]: createUserRule,
  [UserAction.Update]: updateUserRule,
  [UserAction.Deactivate]: deactivateUserRule,
  [UserAction.View]: viewUserRule,
  [UserAction.ListAll]: listAllUsersRule,
  [UserAction.ViewProfile]: viewProfileRule,
  [UserAction.ViewPreferences]: viewPreferencesRule,
  [UserAction.UpdateProfile]: updateProfileRule,
  [UserAction.UpdatePreferences]: updatePreferencesRule
}

export interface UserAuthorizationPayloadMap {
  [UserAction.Create]: { newUsersRoles: UserRoleEnum[] }
  [UserAction.Update]: { user: UserDTO }
  [UserAction.Deactivate]: undefined
  [UserAction.View]: { user: UserDTO }
  [UserAction.ListAll]: undefined
  [UserAction.ViewProfile]: { user: UserDTO }
  [UserAction.ViewPreferences]: { user: UserDTO }
  [UserAction.UpdateProfile]: { user: UserDTO }
  [UserAction.UpdatePreferences]: { user: UserDTO }
}

export const userRequestBuilderMap = {
  [UserAction.Create]: (requester: IRequester | null, payload: { newUsersRoles: UserRoleEnum[] }) => ({
    requester,
    action: UserAction.Create,
    resource: { type: UserResourceType.User, attributes: { newUsersRoles: payload.newUsersRoles } }
  }),
  [UserAction.Update]: (requester: IRequester | null, payload: { user: UserDTO }) => ({
    requester,
    action: UserAction.Update,
    resource: { type: UserResourceType.User, id: payload.user.id.toString(), attributes: { user: payload.user } }
  }),
  [UserAction.Deactivate]: (requester: IRequester | null) => ({
    requester,
    action: UserAction.Deactivate,
    resource: { type: UserResourceType.User }
  }),
  [UserAction.View]: (requester: IRequester | null, payload: { user: UserDTO }) => ({
    requester,
    action: UserAction.View,
    resource: { type: UserResourceType.User, id: payload.user.id.toString(), attributes: { user: payload.user } }
  }),
  [UserAction.ListAll]: (requester: IRequester | null) => ({
    requester,
    action: UserAction.ListAll,
    resource: { type: UserResourceType.User }
  }),
  [UserAction.ViewProfile]: (requester: IRequester | null, payload: { user: UserDTO }) => ({
    requester,
    action: UserAction.ViewProfile,
    resource: { type: UserResourceType.User, id: payload.user.id.toString(), attributes: { user: payload.user } }
  }),
  [UserAction.ViewPreferences]: (requester: IRequester | null, payload: { user: UserDTO }) => ({
    requester,
    action: UserAction.ViewPreferences,
    resource: { type: UserResourceType.User, id: payload.user.id.toString(), attributes: { user: payload.user } }
  }),
  [UserAction.UpdateProfile]: (requester: IRequester | null, payload: { user: UserDTO }) => ({
    requester,
    action: UserAction.UpdateProfile,
    resource: { type: UserResourceType.User, id: payload.user.id.toString(), attributes: { user: payload.user } }
  }),
  [UserAction.UpdatePreferences]: (requester: IRequester | null, payload: { user: UserDTO }) => ({
    requester,
    action: UserAction.UpdatePreferences,
    resource: { type: UserResourceType.User, id: payload.user.id.toString(), attributes: { user: payload.user } }
  })
}
