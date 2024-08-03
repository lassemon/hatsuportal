import { DomainError } from '@hatsuportal/shared-kernel'

// TODO, remove this, replace with case specific errors
export class InvalidUserPropertyError extends DomainError {
  constructor(message?: unknown) {
    super(message || 'Invalid user property')
  }
}
