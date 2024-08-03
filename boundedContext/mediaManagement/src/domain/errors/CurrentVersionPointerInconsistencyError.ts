import { DomainError } from '@hatsuportal/shared-kernel'

export class CurrentVersionPointerInconsistencyError extends DomainError {
  constructor(message?: unknown) {
    super(message || 'Current version pointer inconsistency')
  }
}
