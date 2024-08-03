import { CommentId } from '../valueObjects/CommentId'
import { Comment } from '../entities/Comment'
import { IRepository } from '@hatsuportal/foundation'

export interface ICommentWriteRepository extends IRepository {
  findByIdForUpdate(id: CommentId): Promise<Comment | null>
  insert(comment: Comment): Promise<Comment>
  update(comment: Comment): Promise<Comment>
  softDelete(id: CommentId): Promise<void>
  /** admin only; permanent removal. */
  deletePermanently(id: CommentId): Promise<void>
}
