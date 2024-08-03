import { DomainError } from '@hatsuportal/common-bounded-context'

export class InvalidPostCreatorNameError extends DomainError {
  constructor(message?: unknown) {
    super(message || 'Invalid post creator name')
  }
}
