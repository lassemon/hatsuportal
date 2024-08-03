import DomainError from './DomainError'

export class InvalidFileSizeError extends DomainError {
  constructor(message?: unknown) {
    super(message || 'Invalid file size')
  }
}
