import { DomainError } from '@hatsuportal/shared-kernel'

export class PostTitleTooLongError extends DomainError {
  constructor(message?: unknown) {
    super(message || 'Post title is too long')
  }
}
