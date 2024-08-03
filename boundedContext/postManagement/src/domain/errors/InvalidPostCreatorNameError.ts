import { DomainError } from '@hatsuportal/shared-kernel'

export class InvalidPostCreatorNameError extends DomainError {
  constructor(message?: unknown) {
    super(message || 'Invalid post creator name')
  }
}
