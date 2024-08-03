import { CreatedAtTimestamp, UnixTimestamp } from '@hatsuportal/shared-kernel'
import { NonEmptyString } from '@hatsuportal/shared-kernel'
import { Comment, CommentAuthorId, CommentId, PostId } from '../../domain'
import { CommentDTO } from '../dtos'

export interface ICommentApplicationMapper {
  toDTO(comment: Comment): CommentDTO
  dtoToDomainEntity(dto: CommentDTO): Comment
}

export class CommentApplicationMapper implements ICommentApplicationMapper {
  toDTO(comment: Comment): CommentDTO {
    return {
      id: comment.id.value,
      postId: comment.postId.value,
      authorId: comment.authorId.value,
      body: comment.body?.value ?? null,
      parentCommentId: comment.parentCommentId?.value ?? null,
      isDeleted: comment.isDeleted,
      createdAt: comment.createdAt.value,
      updatedAt: comment.updatedAt.value
    }
  }

  dtoToDomainEntity(dto: CommentDTO): Comment {
    return Comment.reconstruct({
      id: new CommentId(dto.id),
      postId: new PostId(dto.postId),
      authorId: new CommentAuthorId(dto.authorId),
      body: dto.body ? new NonEmptyString(dto.body) : null,
      parentCommentId: dto.parentCommentId ? new CommentId(dto.parentCommentId) : CommentId.NOT_SET,
      isDeleted: dto.isDeleted,
      createdAt: new CreatedAtTimestamp(dto.createdAt),
      updatedAt: new UnixTimestamp(dto.updatedAt)
    })
  }
}
