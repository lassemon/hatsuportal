import { DomainError } from '@hatsuportal/foundation'

export class InvalidPostVisibilityError extends DomainError {
  constructor(message?: unknown) {
    super(message || 'Invalid post visibility')
  }
}
