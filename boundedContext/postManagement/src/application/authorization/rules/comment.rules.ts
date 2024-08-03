import {
  IAuthorizationRequest,
  IRequester,
  defineRule,
  isSuperAdmin,
  isAuthorOf,
  requireLoggedInActive,
  requireAuthorOrAdmin,
  requesterDisplayName
} from '@hatsuportal/platform'
import { CommentDTO, PostDTO } from '../../dtos'

export enum CommentAction {
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

function commentFrom(authorizationRequest: IAuthorizationRequest): CommentDTO | undefined {
  const resourceAttributes = authorizationRequest.resource?.attributes as { comment?: CommentDTO } | undefined
  return resourceAttributes?.comment
}

function isCommentAuthor(authorizationRequest: IAuthorizationRequest): boolean {
  return isAuthorOf(
    authorizationRequest,
    (authorizationRequestForAuthorLookup) => commentFrom(authorizationRequestForAuthorLookup)?.authorId
  )
}
function isDeleted(request: IAuthorizationRequest<{ comment: CommentDTO }>): boolean {
  return request.resource?.attributes?.comment.isDeleted === true
}

const addCommentRule = defineRule<AddCommentAuthorizationAttributes>()({
  action: CommentAction.Add,
  resourceType: CommentResourceType.Post,
  condition: (request) => {
    const isNotLoggedInOrActiveDenial = requireLoggedInActive(request)
    if (isNotLoggedInOrActiveDenial) return isNotLoggedInOrActiveDenial
    return { allowed: true }
  }
})

const addReplyRule = defineRule<AddReplyAuthorizationAttributes>()({
  action: CommentAction.AddReply,
  resourceType: CommentResourceType.Comment,
  condition: (request) => {
    const isNotLoggedInOrActiveDenial = requireLoggedInActive(request)
    if (isNotLoggedInOrActiveDenial) return isNotLoggedInOrActiveDenial
    return { allowed: true }
  }
})

const editCommentRule = defineRule<EditCommentAuthorizationAttributes>()({
  action: CommentAction.Edit,
  resourceType: CommentResourceType.Comment,
  condition: (request) => {
    const isNotLoggedInOrActiveDenial = requireLoggedInActive(request)
    if (isNotLoggedInOrActiveDenial) return isNotLoggedInOrActiveDenial
    if (!isCommentAuthor(request)) {
      return {
        allowed: false,
        reason: `User ${requesterDisplayName(request)} does not have permission to edit this comment.`
      }
    }
    if (isDeleted(request)) {
      return { allowed: false, reason: 'Cannot edit a deleted comment.' }
    }
    return { allowed: true }
  }
})

const softDeleteRule = defineRule<SoftDeleteAuthorizationAttributes>()({
  action: CommentAction.SoftDelete,
  resourceType: CommentResourceType.Comment,
  condition: (request) => {
    if (isDeleted(request)) {
      return { allowed: true } // idempotent
    }
    const isNotLoggedInOrActiveDenial = requireLoggedInActive(request)
    if (isNotLoggedInOrActiveDenial) return isNotLoggedInOrActiveDenial
    if (!isCommentAuthor(request)) {
      return {
        allowed: false,
        reason: `User ${requesterDisplayName(request)} does not have permission to soft delete this comment.`
      }
    }
    return { allowed: true }
  }
})

const hardDeleteRule = defineRule<HardDeleteAuthorizationAttributes>()({
  action: CommentAction.HardDelete,
  resourceType: CommentResourceType.Comment,
  condition: (request) => {
    const deny = requireLoggedInActive(request)
    if (deny) return deny
    const isNotAuthorOrAdminDenial = requireAuthorOrAdmin(
      request,
      isCommentAuthor,
      `User ${requesterDisplayName(request)} does not have permission to hard delete this comment.`
    )
    if (isNotAuthorOrAdminDenial) return isNotAuthorOrAdminDenial
    if (!isDeleted(request) && !isSuperAdmin(request)) {
      return {
        allowed: false,
        reason: `User ${requesterDisplayName(request)} does not have permission to hard delete comment '${request.resource?.id}' that is not soft deleted.`
      }
    }
    return { allowed: true }
  }
})

export const commentRuleMap = {
  [CommentAction.Add]: addCommentRule,
  [CommentAction.AddReply]: addReplyRule,
  [CommentAction.Edit]: editCommentRule,
  [CommentAction.SoftDelete]: softDeleteRule,
  [CommentAction.HardDelete]: hardDeleteRule
}

export interface CommentAuthorizationPayloadMap {
  [CommentAction.Add]: { post: PostDTO }
  [CommentAction.AddReply]: { post: PostDTO; parentComment: CommentDTO }
  [CommentAction.Edit]: { comment: CommentDTO }
  [CommentAction.SoftDelete]: { comment: CommentDTO }
  [CommentAction.HardDelete]: { comment: CommentDTO }
}

export const commentRequestBuilderMap = {
  [CommentAction.Add]: (requester: IRequester | null, payload: { post: PostDTO }) => ({
    requester,
    action: CommentAction.Add,
    resource: { type: CommentResourceType.Post, id: payload.post.id, attributes: { post: payload.post } }
  }),
  [CommentAction.AddReply]: (requester: IRequester | null, payload: { post: PostDTO; parentComment: CommentDTO }) => ({
    requester,
    action: CommentAction.AddReply,
    resource: {
      type: CommentResourceType.Comment,
      id: payload.parentComment.id,
      attributes: { post: payload.post, parentComment: payload.parentComment }
    }
  }),
  [CommentAction.Edit]: (requester: IRequester | null, payload: { comment: CommentDTO }) => ({
    requester,
    action: CommentAction.Edit,
    resource: {
      type: CommentResourceType.Comment,
      id: payload.comment.id,
      attributes: { comment: payload.comment }
    }
  }),
  [CommentAction.SoftDelete]: (requester: IRequester | null, payload: { comment: CommentDTO }) => ({
    requester,
    action: CommentAction.SoftDelete,
    resource: {
      type: CommentResourceType.Comment,
      id: payload.comment.id,
      attributes: { comment: payload.comment }
    }
  }),
  [CommentAction.HardDelete]: (requester: IRequester | null, payload: { comment: CommentDTO }) => ({
    requester,
    action: CommentAction.HardDelete,
    resource: {
      type: CommentResourceType.Comment,
      id: payload.comment.id,
      attributes: { comment: payload.comment }
    }
  })
}
