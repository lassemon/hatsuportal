import { DomainError } from '@hatsuportal/shared-kernel'

export class VersionStateConflictError extends DomainError {
  constructor(message?: unknown) {
    super(message || 'Version state conflict')
  }
}
