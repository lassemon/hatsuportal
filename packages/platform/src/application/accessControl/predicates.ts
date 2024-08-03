import { UserRoleEnum } from '@hatsuportal/common'
import type { IAuthorizationDecision, IAuthorizationRequest } from './abac/types'

/** Display name of the requester for messages; undefined when not logged in. */
export function requesterDisplayName(request: IAuthorizationRequest): string | undefined {
  return request.requester?.name
}

export function isLoggedIn(request: IAuthorizationRequest): boolean {
  return !!request.requester
}
export function isActive(request: IAuthorizationRequest): boolean {
  return request.requester?.attributes?.active === true
}

/**
 * Returns a deny decision if the requester is not logged in or not active.
 * Returns null if both checks pass (caller may proceed).
 */
export function requireLoggedInActive(request: IAuthorizationRequest): IAuthorizationDecision | null {
  if (!isLoggedIn(request)) {
    return { allowed: false, reason: 'User is not logged in.' }
  }
  if (!isActive(request)) {
    return { allowed: false, reason: `User ${requesterDisplayName(request)} is not active.` }
  }
  return null
}

/**
 * Checks if the requester is the author of the resource.
 * @param request The authorization request
 * @param getAuthorId Function that extracts the author id from the request's resource attributes
 */
export function isAuthorOf(request: IAuthorizationRequest, getAuthorId: (request: IAuthorizationRequest) => string | undefined): boolean {
  const authorId = getAuthorId(request)
  return !!authorId && request.requester?.userId === authorId
}

/**
 * Returns a deny decision if the requester is neither the author nor an admin.
 * Returns null if the requester is author or admin (caller may proceed).
 */
export function requireAuthorOrAdmin(
  request: IAuthorizationRequest,
  isAuthor: (request: IAuthorizationRequest) => boolean,
  denyReason: string
): IAuthorizationDecision | null {
  if (isAuthor(request) || isAdmin(request)) return null
  return { allowed: false, reason: denyReason }
}

export function isAdmin(request: IAuthorizationRequest): boolean {
  return (
    !!request.requester &&
    Array.isArray(request.requester.roles) &&
    (request.requester.roles.includes(UserRoleEnum.Admin) || request.requester.roles.includes(UserRoleEnum.SuperAdmin))
  )
}
export function isSuperAdmin(request: IAuthorizationRequest): boolean {
  return !!request.requester && Array.isArray(request.requester.roles) && request.requester.roles.includes(UserRoleEnum.SuperAdmin)
}
export function isSelf(request: IAuthorizationRequest): boolean {
  return request.resource?.id === request.requester?.userId
}
export function hasRole(req: IAuthorizationRequest<{}>, role: string): boolean {
  return !!req.requester && Array.isArray(req.requester.roles) && req.requester.roles.includes(role)
}
