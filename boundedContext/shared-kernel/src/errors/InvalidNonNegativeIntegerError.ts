import { DomainError } from '@hatsuportal/foundation'

export class InvalidNonNegativeIntegerError extends DomainError {
  constructor(message?: unknown) {
    super(message || 'Invalid non negative integer')
  }
}
