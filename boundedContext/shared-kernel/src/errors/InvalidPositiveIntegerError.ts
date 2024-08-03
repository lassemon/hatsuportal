import { DomainError } from '@hatsuportal/foundation'

export class InvalidPositiveIntegerError extends DomainError {
  constructor(message?: unknown) {
    super(message || 'Invalid positive integer')
  }
}
