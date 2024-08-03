import { DomainError } from '@hatsuportal/shared-kernel'

export class StoryBodyTooLongError extends DomainError {
  constructor(message?: unknown) {
    super(message || 'Story body is too long')
  }
}
