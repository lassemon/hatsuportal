import DomainError from './DomainError'

export class InvalidEntityTypeError extends DomainError {
  constructor(message?: unknown) {
    super(message || 'Invalid entity type')
  }
}
