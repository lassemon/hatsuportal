import DomainError from './DomainError'

export class InvalidImageCreatorNameError extends DomainError {
  constructor(message?: unknown) {
    super(message || 'Invalid image creator name')
  }
}
