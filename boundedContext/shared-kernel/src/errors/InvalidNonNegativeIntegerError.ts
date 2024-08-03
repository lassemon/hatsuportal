import DomainError from './DomainError'

export class InvalidNonNegativeIntegerError extends DomainError {
  constructor(message?: unknown) {
    super(message || 'Invalid non negative integer')
  }
}
