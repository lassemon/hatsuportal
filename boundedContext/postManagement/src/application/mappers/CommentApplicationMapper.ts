import { Comment } from '../../domain'
import { CommentDTO } from '../dtos'

export interface ICommentApplicationMapper {
  toDTO(comment: Comment): CommentDTO
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
}
