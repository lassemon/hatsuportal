import { UniqueId } from '@hatsuportal/shared-kernel'
import { InvalidCommentIdError } from '../errors/InvalidCommentIdError'

export class CommentId extends UniqueId {
  static override canCreate(value: string): boolean {
    try {
      CommentId.assertCanCreate(value)
      return true
    } catch (error) {
      return false
    }
  }

  static override assertCanCreate(value: string): void {
    new CommentId(value)
  }

  constructor(value: string) {
    try {
      super(value)
    } catch (error) {
      throw new InvalidCommentIdError(error)
    }
  }
}
