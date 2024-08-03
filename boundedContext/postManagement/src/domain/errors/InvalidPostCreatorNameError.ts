import { DomainError } from '@hatsuportal/foundation'

export class InvalidPostCreatorNameError extends DomainError {
  constructor(message?: unknown) {
    super(message || 'Invalid post creator name')
  }
}
