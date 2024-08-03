import { UniqueId } from '@hatsuportal/shared-kernel'
import { InvalidCommentIdError } from '../errors/InvalidCommentIdError'
import { Maybe } from '@hatsuportal/common'

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

  static fromOptional(value: Maybe<CommentId> | string): CommentId | null {
    if (!value) {
      return null
    }
    return value instanceof CommentId ? value : new CommentId(value)
  }

  constructor(value: string) {
    try {
      super(value)
    } catch (error) {
      throw new InvalidCommentIdError(error)
    }
  }
}
