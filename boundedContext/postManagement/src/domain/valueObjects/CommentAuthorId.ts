import { InvalidCommentAuthorIdError } from '../errors/InvalidCommentAuthorIdError'
import { UniqueId } from '@hatsuportal/shared-kernel'

export class CommentAuthorId extends UniqueId {
  static override canCreate(value: string): boolean {
    try {
      CommentAuthorId.assertCanCreate(value)
      return true
    } catch (error) {
      return false
    }
  }

  static override assertCanCreate(value: string): void {
    new CommentAuthorId(value)
  }

  constructor(value: string) {
    try {
      super(value)
    } catch (error) {
      throw new InvalidCommentAuthorIdError(error)
    }
  }
}
