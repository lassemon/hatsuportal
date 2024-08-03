import { DomainError } from '@hatsuportal/shared-kernel'

export class PostTitleEmptyError extends DomainError {
  constructor(message?: unknown) {
    super(message || 'Post title cannot be empty')
  }
}
