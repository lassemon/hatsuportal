import { DomainError } from '@hatsuportal/shared-kernel'

export class InvalidVersionStateForCurrentUpdateError extends DomainError {
  constructor(message?: unknown) {
    super(message || 'Invalid version state for current update')
  }
}
