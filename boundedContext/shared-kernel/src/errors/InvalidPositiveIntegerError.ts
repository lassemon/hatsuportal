import DomainError from './DomainError'

export class InvalidPositiveIntegerError extends DomainError {
  constructor(message?: unknown) {
    super(message || 'Invalid positive integer')
  }
}
