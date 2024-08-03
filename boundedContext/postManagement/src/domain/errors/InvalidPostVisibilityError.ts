import { DomainError } from '@hatsuportal/common-bounded-context'

export class InvalidPostVisibilityError extends DomainError {
  constructor(message?: unknown) {
    super(message || 'Invalid post visibility')
  }
}
