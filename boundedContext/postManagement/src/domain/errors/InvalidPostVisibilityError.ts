import { DomainError } from '@hatsuportal/shared-kernel'

export class InvalidPostVisibilityError extends DomainError {
  constructor(message?: unknown) {
    super(message || 'Invalid post visibility')
  }
}
