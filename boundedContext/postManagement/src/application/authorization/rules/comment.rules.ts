import { UserRoleEnum } from '@hatsuportal/common'
import { IAuthorizationRequest, Rule } from '@hatsuportal/platform'
import { CommentDTO, PostDTO } from '../../dtos'
import { defineRule } from '@hatsuportal/platform'

export enum CommenAction {
  Add = 'comment:add',
  AddReply = 'comment:add-reply',
  Edit = 'comment:edit',
  SoftDelete = 'comment:soft-delete',
  HardDelete = 'comment:hard-delete'
}

export enum CommentResourceType {
  Post = 'Post',
  Comment = 'Comment'
}

export interface AddCommentAuthorizationAttributes {
  post: PostDTO
}

export interface AddReplyAuthorizationAttributes {
  post: PostDTO
  parentComment: CommentDTO
}

export interface EditCommentAuthorizationAttributes {
  comment: CommentDTO
}

export interface SoftDeleteAuthorizationAttributes {
  comment: CommentDTO
}

export interface HardDeleteAuthorizationAttributes {
  comment: CommentDTO
}

function isLoggedIn(request: IAuthorizationRequest): boolean {
  return !!request.requester
}
function isActive(request: IAuthorizationRequest): boolean {
  return request.requester?.attributes?.active === true
}
function isAdmin(request: IAuthorizationRequest): boolean {
  return (
    Array.isArray(request.requester?.roles) &&
    (request.requester!.roles.includes(UserRoleEnum.Admin) || request.requester!.roles.includes(UserRoleEnum.SuperAdmin))
  )
}
function isSuperAdmin(request: IAuthorizationRequest): boolean {
  return Array.isArray(request.requester?.roles) && request.requester!.roles.includes(UserRoleEnum.SuperAdmin)
}
function isAuthor(request: IAuthorizationRequest<{ comment: CommentDTO }>): boolean {
  const authorId = request.resource?.attributes?.comment.authorId
  return !!authorId && request.requester?.userId === authorId
}
function isDeleted(request: IAuthorizationRequest<{ comment: CommentDTO }>): boolean {
  return request.resource?.attributes?.comment.isDeleted === true
}
function postExists(request: IAuthorizationRequest<{ post: PostDTO }>): boolean {
  return !!request.resource?.attributes?.post
}
function parentCommentExists(request: IAuthorizationRequest<{ parentComment: CommentDTO }>): boolean {
  return !!request.resource?.attributes?.parentComment
}
function parentCommentBelongsToPost(request: IAuthorizationRequest<{ parentComment: CommentDTO; post: PostDTO }>): boolean {
  const postId = request.resource?.attributes?.post.id
  return !!postId && request.resource?.attributes?.parentComment.postId === postId
}

const addCommentRule = defineRule<AddCommentAuthorizationAttributes>()({
  action: CommenAction.Add,
  resourceType: CommentResourceType.Post,
  reason: 'Only active users can add comments to an existing post',
  condition: (request) => {
    if (!isLoggedIn(request)) {
      return { allowed: false, reason: `User is not logged in.` }
    }
    if (!isActive(request)) {
      return { allowed: false, reason: `User ${request.requester?.name} is not active.` }
    }

    return { allowed: true }
  }
})

const addReplyRule = defineRule<AddReplyAuthorizationAttributes>()({
  action: CommenAction.AddReply,
  resourceType: CommentResourceType.Comment,
  condition: (request) => {
    if (!isLoggedIn(request)) {
      return { allowed: false, reason: `User is not logged in.` }
    }

    if (!isActive(request)) {
      return { allowed: false, reason: `User ${request.requester?.name} is not active.` }
    }

    if (!postExists(request)) {
      return { allowed: false, reason: `Post with id ${request.resource?.attributes?.post.id} does not exist` }
    }

    if (!parentCommentExists(request)) {
      return { allowed: false, reason: `Parent comment with id ${request.resource?.attributes?.parentComment.id} does not exist` }
    }

    if (!parentCommentBelongsToPost(request)) {
      return {
        allowed: false,
        reason: `Trying to reply to parentCommentId '${request.resource?.attributes?.parentComment.id}' but parent comment does not belong to the same postId '${request.resource?.attributes?.post.id}' that we are trying to reply to. Parent comment instead belongs to postId '${request.resource?.attributes?.parentComment.postId}'.`
      }
    }

    return { allowed: true }
  }
})

const editCommentRule = defineRule<EditCommentAuthorizationAttributes>()({
  action: CommenAction.Edit,
  resourceType: CommentResourceType.Comment,
  condition: (request) => {
    if (!isLoggedIn(request)) {
      return { allowed: false, reason: `User is not logged in.` }
    }
    if (!isActive(request)) {
      return { allowed: false, reason: `User ${request.requester?.name} is not active.` }
    }
    if (!isAuthor(request)) {
      return { allowed: false, reason: `Cannot edit comment that is not created by you.` }
    }
    if (!isDeleted(request)) {
      return { allowed: false, reason: `Cannot edit a deleted comment.` }
    }
    return { allowed: true }
  }
})

const softDeleteRule = defineRule<SoftDeleteAuthorizationAttributes>()({
  action: CommenAction.SoftDelete,
  resourceType: CommentResourceType.Comment,
  condition: (request) => {
    if (isDeleted(request)) {
      return { allowed: true } // idempotent
    }

    if (!isLoggedIn(request)) {
      return { allowed: false, reason: `User is not logged in.` }
    }
    if (!isActive(request)) {
      return { allowed: false, reason: `User ${request.requester?.name} is not active.` }
    }
    if (!isAuthor(request)) {
      return { allowed: false, reason: `Cannot soft delete comment that is not created by you.` }
    }

    return { allowed: true }
  }
})

const hardDeleteRule = defineRule<HardDeleteAuthorizationAttributes>()({
  action: CommenAction.HardDelete,
  resourceType: CommentResourceType.Comment,
  condition: (request) => {
    if (!isLoggedIn(request)) {
      return { allowed: false, reason: `User is not logged in.` }
    }
    if (!isActive(request)) {
      return { allowed: false, reason: `User ${request.requester?.name} is not active.` }
    }
    if (!isAuthor(request) && !isAdmin(request)) {
      return { allowed: false, reason: `Cannot hard delete comment that is not created by you.` }
    }
    if (!isDeleted(request) && !isSuperAdmin(request)) {
      return { allowed: false, reason: `Cannot hard delete a comment that is not soft deleted without being a super admin.` }
    }
    return { allowed: true }
  }
})

export const commentRules: Rule[] = [addCommentRule, addReplyRule, editCommentRule, softDeleteRule, hardDeleteRule]
