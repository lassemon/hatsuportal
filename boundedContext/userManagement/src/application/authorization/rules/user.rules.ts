import { UserRoleEnum } from '@hatsuportal/common'
import { defineRule, IAuthorizationRequest, Rule } from '@hatsuportal/platform'
import { UserDTO } from '../../dtos'

export enum UserAction {
  Create = 'user:create',
  Update = 'user:update',
  Deactivate = 'user:deactivate',
  View = 'user:view',
  ListAll = 'user:list-all'
}

export enum UserResourceType {
  User = 'User'
}

export interface CreateUserAuthorizationAttributes {}

export interface UpdateUserAuthorizationAttributes {
  user: UserDTO
}

export interface DeactivateUserAuthorizationAttributes {
  user: UserDTO
}

export interface ViewUserAuthorizationAttributes {
  user: UserDTO
}

export interface ListAllUsersAuthorizationAttributes {}

function isLoggedIn(req: IAuthorizationRequest): boolean {
  return !!req.requester
}
function isActive(req: IAuthorizationRequest): boolean {
  return req.requester?.attributes?.active === true
}
function isAdmin(req: IAuthorizationRequest): boolean {
  return (
    Array.isArray(req.requester?.roles) &&
    (req.requester!.roles.includes(UserRoleEnum.Admin) || req.requester!.roles.includes(UserRoleEnum.SuperAdmin))
  )
}
function isSelf(req: IAuthorizationRequest): boolean {
  return req.resource?.id === req.requester?.userId
}

const createUserRule = defineRule<CreateUserAuthorizationAttributes>()({
  action: UserAction.Create,
  resourceType: UserResourceType.User,
  condition: (request) => {
    if (!isLoggedIn(request)) {
      return { allowed: false, reason: `User is not logged in.` }
    }
    if (!isActive(request)) {
      return { allowed: false, reason: `User ${request.requester?.name} is not active.` }
    }
    if (!isAdmin(request)) {
      return { allowed: false, reason: `User ${request.requester?.name} does not have proper role to create a new user.` }
    }
    return { allowed: true }
  }
})

const updateUserRule = defineRule<UpdateUserAuthorizationAttributes>()({
  action: UserAction.Update,
  resourceType: UserResourceType.User,
  condition: (request) => {
    if (!isLoggedIn(request)) {
      return { allowed: false, reason: `User is not logged in.` }
    }
    if (!isActive(request)) {
      return { allowed: false, reason: `User ${request.requester?.name} is not active.` }
    }
    if (!isSelf(request) && !isAdmin(request)) {
      return {
        allowed: false,
        reason: `User ${request.requester?.name} does not have proper role to update this user ${request.resource?.id}.`
      }
    }
    return { allowed: true }
  }
})

const deactivateUserRule = defineRule<DeactivateUserAuthorizationAttributes>()({
  action: UserAction.Deactivate,
  resourceType: UserResourceType.User,
  condition: (request) => {
    if (!isLoggedIn(request)) {
      return { allowed: false, reason: `User is not logged in.` }
    }
    if (!isActive(request)) {
      return { allowed: false, reason: `User ${request.requester?.name} is not active.` }
    }
    if (!isAdmin(request)) {
      return {
        allowed: false,
        reason: `User ${request.requester?.name} does not have proper role to deactivate user ${request.resource?.id}.`
      }
    }
    return { allowed: true }
  }
})

const viewUserRule = defineRule<ViewUserAuthorizationAttributes>()({
  action: UserAction.View,
  resourceType: UserResourceType.User,
  condition: (request) => {
    if (!isSelf(request) && !isAdmin(request)) {
      return { allowed: false, reason: `User ${request.requester?.name} does not have proper role to view user ${request.resource?.id}.` }
    }
    if (!isActive(request) && !isSelf(request) && !isAdmin(request)) {
      return { allowed: false, reason: `User ${request.requester?.name} is not active.` }
    }

    return { allowed: true }
  }
})

const listAllUsersRule = defineRule<ListAllUsersAuthorizationAttributes>()({
  action: UserAction.ListAll,
  resourceType: UserResourceType.User,
  condition: (request) => {
    if (!isLoggedIn(request)) {
      return { allowed: false, reason: `User is not logged in.` }
    }
    if (!isActive(request)) {
      return { allowed: false, reason: `User ${request.requester?.name} is not active.` }
    }
    if (!isAdmin(request)) {
      return { allowed: false, reason: `User ${request.requester?.name} does not have proper role to list all users.` }
    }
    return { allowed: true }
  }
})

export const userRules: Rule[] = [createUserRule, updateUserRule, deactivateUserRule, viewUserRule, listAllUsersRule]
