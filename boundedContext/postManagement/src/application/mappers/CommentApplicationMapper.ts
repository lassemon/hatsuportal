import { unixtimeNow, uuid } from '@hatsuportal/common'
import { NonEmptyString, UnixTimestamp } from '@hatsuportal/shared-kernel'
import { Comment, CommentId, PostId } from '../../domain'
import { AddCommentInputDTO, CommentDTO, EditCommentInputDTO } from '../dtos'
import { CommentAuthorId } from '../../domain/valueObjects/CommentAuthorId'

export interface ICommentApplicationMapper {
  toDTO(comment: Comment): CommentDTO
  createInputToDomainEntity(addCommentInput: AddCommentInputDTO): Comment
  mergeUpdate(editCommentInput: EditCommentInputDTO, existingComment: Comment): Comment
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

  createInputToDomainEntity(addCommentInput: AddCommentInputDTO): Comment {
    const newCommentId = uuid()
    const now = unixtimeNow()

    return Comment.create({
      id: new CommentId(newCommentId),
      postId: new PostId(addCommentInput.postId),
      authorId: new CommentAuthorId(addCommentInput.authorId),
      body: new NonEmptyString(addCommentInput.body.trim()),
      parentCommentId: addCommentInput.parentCommentId ? new CommentId(addCommentInput.parentCommentId) : null,
      isDeleted: false,
      createdAt: new UnixTimestamp(now),
      updatedAt: new UnixTimestamp(now)
    })
  }

  mergeUpdate(editCommentInput: EditCommentInputDTO, existingComment: Comment): Comment {
    //let props: Partial<CommentProps> = {}

    // TODO, REMOVE THIS AND REPLACE WITH Story DOMAIN ENTITY SETTERS
    //props = withField(props, 'body', editCommentInput.body.trim())

    //existingComment.update(props)

    return existingComment
  }
}
