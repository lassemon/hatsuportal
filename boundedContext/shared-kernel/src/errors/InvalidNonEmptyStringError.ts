import DomainError from './DomainError'

export class InvalidNonEmptyStringError extends DomainError {
  constructor(message?: unknown) {
    super(message || 'Invalid non empty string')
  }
}
