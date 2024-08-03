import { DomainError } from '@hatsuportal/shared-kernel'

export class CommentBodyEmptyError extends DomainError {
  constructor(message?: unknown) {
    super(message || 'Comment body cannot be empty')
  }
}
