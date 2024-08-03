import { DomainError } from '@hatsuportal/shared-kernel'

export class InvalidVersionStateForStagingError extends DomainError {
  constructor(message?: unknown) {
    super(message || 'Invalid version state for staging')
  }
}
