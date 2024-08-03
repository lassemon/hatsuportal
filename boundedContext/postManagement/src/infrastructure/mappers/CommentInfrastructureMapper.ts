import { CommentDatabaseSchema } from '../schemas/CommentDatabaseSchema'
import { CommentReadModelDTO } from '../../application/dtos/comment/CommentReadModelDTO'
import { ReplyListChunkReadModelDTO } from '../../application/dtos/comment/ReplyListChunkReadModelDTO'
import { Comment, CommentAuthorId, CommentId, PostId } from '../../domain'
import { MappingError } from '../../application/errors/MappingError'
import { PartialExceptFor } from '@hatsuportal/common'
import { NonEmptyString, UnixTimestamp } from '@hatsuportal/shared-kernel'

export interface ICommentInfrastructureMapper {
  toDTO(comment: CommentDatabaseSchema, replies: ReplyListChunkReadModelDTO): CommentReadModelDTO
  toCommentInsertRecord(comment: Comment): Omit<CommentDatabaseSchema, 'replyCount' | 'hasReplies'>
  toCommentUpdateRecord(comment: Comment): PartialExceptFor<CommentDatabaseSchema, 'id'>
  toDomainEntity(comment: CommentDatabaseSchema): Comment
}

export class CommentInfrastructureMapper implements ICommentInfrastructureMapper {
  toDTO(comment: CommentDatabaseSchema, replies: ReplyListChunkReadModelDTO): CommentReadModelDTO {
    return {
      id: comment.id,
      postId: comment.postId,
      authorId: comment.authorId,
      body: comment.body,
      parentCommentId: comment.parentCommentId,
      isDeleted: comment.isDeleted,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      replyCount: comment.replyCount,
      hasReplies: comment.hasReplies,
      repliesPreview: replies
    }
  }

  toCommentInsertRecord(comment: Comment): Omit<CommentDatabaseSchema, 'replyCount' | 'hasReplies'> {
    if (!comment.body) {
      throw new MappingError('Comment body is required')
    }

    return {
      id: comment.id.value,
      postId: comment.postId.value,
      authorId: comment.authorId.value,
      body: comment.body.value,
      parentCommentId: comment.parentCommentId?.value ?? null,
      isDeleted: comment.isDeleted,
      createdAt: comment.createdAt.value,
      updatedAt: comment.updatedAt.value
    }
  }

  toCommentUpdateRecord(comment: Comment): PartialExceptFor<CommentDatabaseSchema, 'id'> {
    if (!comment.body) {
      throw new MappingError('Comment body is required')
    }

    return {
      id: comment.id.value,
      body: comment.body.value,
      isDeleted: comment.isDeleted
    }
  }

  toDomainEntity(comment: CommentDatabaseSchema): Comment {
    return Comment.reconstruct({
      id: new CommentId(comment.id),
      postId: new PostId(comment.postId),
      authorId: new CommentAuthorId(comment.authorId),
      body: comment.body ? new NonEmptyString(comment.body) : null,
      parentCommentId: comment.parentCommentId ? new CommentId(comment.parentCommentId) : null,
      isDeleted: comment.isDeleted,
      createdAt: new UnixTimestamp(comment.createdAt),
      updatedAt: new UnixTimestamp(comment.updatedAt)
    })
  }
}
