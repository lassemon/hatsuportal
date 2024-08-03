import { DomainError } from '@hatsuportal/shared-kernel'

export class CommentBodyTooLongError extends DomainError {
  constructor(message?: unknown) {
    super(message || 'Comment body is too long')
  }
}
