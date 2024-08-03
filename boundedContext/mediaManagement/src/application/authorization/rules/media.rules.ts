import { UserRoleEnum } from '@hatsuportal/common'
import { defineRule, IAuthorizationRequest, Rule } from '@hatsuportal/platform'

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

function hasRole(request: IAuthorizationRequest, role: string): boolean {
  return Array.isArray(request.requester?.roles) && request.requester!.roles.includes(role)
}

function isAuthor(request: IAuthorizationRequest<{ image: ImageDTO }>): boolean {
  const authorId = request.resource?.attributes?.image.createdById as string | undefined
  return !!authorId && request.requester?.userId === authorId
}

const createImageRule = defineRule<CreateImageAuthorizationAttributes>()({
  action: MediaAction.Create,
  resourceType: MediaResourceType.Image,
  condition: (request) => {
    if (!hasRole(request, UserRoleEnum.Creator)) {
      return { allowed: false, reason: 'Only users with the Creator role can create images' }
    }
    return { allowed: true }
  }
})

const updateImageRule = defineRule<UpdateImageAuthorizationAttributes>()({
  action: MediaAction.Update,
  resourceType: MediaResourceType.Image,
  condition: (request) => {
    if (!isAuthor(request)) {
      return { allowed: false, reason: 'Only the author can update the image' }
    }
    return { allowed: true }
  }
})

const deleteImageRule = defineRule<DeleteImageAuthorizationAttributes>()({
  action: MediaAction.Delete,
  resourceType: MediaResourceType.Image,
  condition: (request) => {
    if (!isAuthor(request)) {
      return { allowed: false, reason: 'Only the author can delete the image' }
    }
    return { allowed: true }
  }
})

export const mediaRules: Rule[] = [createImageRule, updateImageRule, deleteImageRule]
