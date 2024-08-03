import { DomainError } from '@hatsuportal/shared-kernel'

export class StoryBodyEmptyError extends DomainError {
  constructor(message?: unknown) {
    super(message || 'Story body cannot be empty')
  }
}
