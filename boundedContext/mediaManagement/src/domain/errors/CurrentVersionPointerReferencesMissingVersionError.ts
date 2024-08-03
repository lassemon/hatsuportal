import { DomainError } from '@hatsuportal/shared-kernel'

export class CurrentVersionPointerReferencesMissingVersionError extends DomainError {
  constructor(message?: unknown) {
    super(message || 'Current version pointer references missing version')
  }
}
