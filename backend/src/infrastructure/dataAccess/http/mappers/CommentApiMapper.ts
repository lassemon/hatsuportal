import {
  GetRepliesInputDTO,
  RepliesPreviewDTO,
  CommentListChunkDTO,
  GetCommentsInputDTO,
  AddCommentInputDTO,
  AddCommentTarget,
  AddCommentTargetKind,
  CommentWithRelationsDTO,
  EditCommentInputDTO,
  DeleteCommentInputDTO
} from '@hatsuportal/post-management'
import { ICommentApiMapper } from '../../../../application/dataAccess'
import {
  AddCommentRequest,
  CommentResponse,
  EditCommentRequest,
  GetCommentsRequest,
  GetCommentsResponse,
  GetRepliesRequest,
  GetRepliesResponse
} from '@hatsuportal/contracts'
import { InvalidRequestError } from '../../../../infrastructure/errors/InvalidRequestError'
import { OrderEnum } from '@hatsuportal/foundation'

export class CommentApiMapper implements ICommentApiMapper {
  constructor() {}

  public toCommentResponse(comment: CommentWithRelationsDTO): CommentResponse {
    return {
      id: comment.id,
      postId: comment.postId,
      authorId: comment.authorId,
      authorName: comment.authorName,
      body: comment.body,
      parentCommentId: comment.parentCommentId,
      isDeleted: comment.isDeleted,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      replyCount: comment.replyCount,
      hasReplies: comment.hasReplies
    }
  }

  public toGetCommentsInputDTO(getCommentsRequest: GetCommentsRequest, postId: string): GetCommentsInputDTO {
    return {
      postId,
      limit: getCommentsRequest.limit ?? 10,
      cursor: getCommentsRequest.cursor,
      sort: OrderEnum.Descending
    }
  }

  public toGetCommentsResponse(commentList: CommentListChunkDTO): GetCommentsResponse {
    return {
      comments: commentList.comments.map((comment) => ({
        id: comment.id,
        postId: comment.postId,
        authorId: comment.authorId,
        authorName: comment.authorName,
        body: comment.body,
        parentCommentId: comment.parentCommentId,
        isDeleted: comment.isDeleted,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
        replyCount: comment.replyCount,
        hasReplies: comment.hasReplies,
        nextCursor: comment.nextCursor,
        repliesPreview: {
          replies: comment.repliesPreview?.replies ?? [],
          nextCursor: comment.repliesPreview?.nextCursor ?? null
        }
      })),
      nextCursor: commentList.nextCursor
    }
  }

  public toGetRepliesInputDTO(getRepliesRequest: GetRepliesRequest, parentCommentId: string): GetRepliesInputDTO {
    return {
      parentCommentId,
      limit: getRepliesRequest.limit ?? 10,
      cursor: getRepliesRequest.cursor
    }
  }

  public toGetRepliesResponse(replies: RepliesPreviewDTO): GetRepliesResponse {
    return {
      replies: replies.replies.map((reply) => ({
        id: reply.id,
        authorId: reply.authorId,
        authorName: reply.authorName,
        body: reply.body,
        isDeleted: reply.isDeleted,
        createdAt: reply.createdAt
      })),
      nextCursor: replies.nextCursor
    }
  }

  public toAddCommentInputDTO(addCommentRequest: AddCommentRequest, postId: string, loggedInUserId?: string): AddCommentInputDTO {
    if (!loggedInUserId) {
      throw new InvalidRequestError('Logged in user ID is required')
    }

    const target: AddCommentTarget = addCommentRequest.parentCommentId
      ? { kind: AddCommentTargetKind.Reply, parentCommentId: addCommentRequest.parentCommentId }
      : { kind: AddCommentTargetKind.TopLevel, postId }

    return {
      postId,
      parentCommentId: addCommentRequest.parentCommentId,
      body: addCommentRequest.body,
      authorId: loggedInUserId,
      target
    }
  }

  public toEditCommentInputDTO(editCommentRequest: EditCommentRequest, commentId: string, loggedInUserId?: string): EditCommentInputDTO {
    if (!loggedInUserId) {
      throw new InvalidRequestError('Logged in user ID is required')
    }

    return {
      commentId,
      body: editCommentRequest.body,
      authorId: loggedInUserId
    }
  }

  public toDeleteCommentInputDTO(commentId: string, loggedInUserId?: string): DeleteCommentInputDTO {
    if (!loggedInUserId) {
      throw new InvalidRequestError('Logged in user ID is required')
    }

    return { commentId, authorId: loggedInUserId }
  }
}
