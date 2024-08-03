import { DomainError } from '@hatsuportal/shared-kernel'

export class CurrentVersionPointerInvalidStateError extends DomainError {
  constructor(message?: unknown) {
    super(message || 'Current version pointer invalid state')
  }
}
