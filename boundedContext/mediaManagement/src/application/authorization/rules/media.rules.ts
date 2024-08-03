import { UserRoleEnum } from '@hatsuportal/common'
import {
  defineRule,
  IAuthorizationRequest,
  IRequester,
  hasRole,
  isAuthorOf,
  isAdmin,
  requesterDisplayName,
  requireLoggedInActive
} from '@hatsuportal/platform'

import { ImageDTO } from '../../dtos'

export enum MediaAction {
  Create = 'image:create',
  Update = 'image:update',
  Delete = 'image:delete'
}

export enum MediaResourceType {
  Image = 'Image'
}

export interface CreateImageAuthorizationAttributes {}

export interface UpdateImageAuthorizationAttributes {
  image: ImageDTO
}

export interface DeleteImageAuthorizationAttributes {
  image: ImageDTO
}

function imageFrom(authorizationRequest: IAuthorizationRequest): ImageDTO | undefined {
  const resourceAttributes = authorizationRequest.resource?.attributes as { image?: ImageDTO } | undefined
  return resourceAttributes?.image
}

function getImageAuthorId(authorizationRequest: IAuthorizationRequest): string | undefined {
  const createdById = imageFrom(authorizationRequest)?.createdById
  return typeof createdById === 'string' ? createdById : createdById != null ? String(createdById) : undefined
}

function isImageAuthor(request: IAuthorizationRequest): boolean {
  return isAuthorOf(request, getImageAuthorId)
}

const createImageRule = defineRule<CreateImageAuthorizationAttributes>()({
  action: MediaAction.Create,
  resourceType: MediaResourceType.Image,
  condition: (request) => {
    const isNotLoggedInOrActiveDenial = requireLoggedInActive(request)
    if (isNotLoggedInOrActiveDenial) return isNotLoggedInOrActiveDenial
    if (!hasRole(request, UserRoleEnum.Creator) && !isAdmin(request)) {
      const requesterName = requesterDisplayName(request)
      return {
        allowed: false,
        reason: requesterName
          ? `User ${requesterName} does not have permission to create images.`
          : 'Only users with the Creator role can create images.'
      }
    }
    return { allowed: true }
  }
})

const updateImageRule = defineRule<UpdateImageAuthorizationAttributes>()({
  action: MediaAction.Update,
  resourceType: MediaResourceType.Image,
  condition: (request) => {
    if (!isImageAuthor(request)) {
      return {
        allowed: false,
        reason: `User ${requesterDisplayName(request)} does not have permission to update image '${request.resource?.id}'.`
      }
    }
    return { allowed: true }
  }
})

const deleteImageRule = defineRule<DeleteImageAuthorizationAttributes>()({
  action: MediaAction.Delete,
  resourceType: MediaResourceType.Image,
  condition: (request) => {
    if (!isImageAuthor(request)) {
      return {
        allowed: false,
        reason: `User ${requesterDisplayName(request)} does not have permission to delete image '${request.resource?.id}'.`
      }
    }
    return { allowed: true }
  }
})

export const mediaRuleMap = {
  [MediaAction.Create]: createImageRule,
  [MediaAction.Update]: updateImageRule,
  [MediaAction.Delete]: deleteImageRule
}

export interface MediaAuthorizationPayloadMap {
  [MediaAction.Create]: undefined
  [MediaAction.Update]: { image: ImageDTO }
  [MediaAction.Delete]: { image: ImageDTO }
}

export const mediaRequestBuilderMap = {
  [MediaAction.Create]: (requester: IRequester | null) => ({
    requester,
    action: MediaAction.Create,
    resource: { type: MediaResourceType.Image }
  }),
  [MediaAction.Update]: (requester: IRequester | null, payload: { image: ImageDTO }) => ({
    requester,
    action: MediaAction.Update,
    resource: { type: MediaResourceType.Image, id: payload.image.id, attributes: { image: payload.image } }
  }),
  [MediaAction.Delete]: (requester: IRequester | null, payload: { image: ImageDTO }) => ({
    requester,
    action: MediaAction.Delete,
    resource: { type: MediaResourceType.Image, id: payload.image.id, attributes: { image: payload.image } }
  })
}
