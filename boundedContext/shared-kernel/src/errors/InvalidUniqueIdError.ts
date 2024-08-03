import DomainError from './DomainError'

export class InvalidUniqueIdError extends DomainError {
  constructor(message?: unknown) {
    super(message || 'Invalid unique id')
  }
}
