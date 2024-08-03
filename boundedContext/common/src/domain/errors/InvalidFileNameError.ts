import DomainError from './DomainError'

export class InvalidFileNameError extends DomainError {
  constructor(message?: unknown) {
    super(message || 'Invalid file name')
  }
}
