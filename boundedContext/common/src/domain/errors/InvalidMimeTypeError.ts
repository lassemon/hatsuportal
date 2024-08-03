import DomainError from './DomainError'

export class InvalidMimeTypeError extends DomainError {
  constructor(message?: unknown) {
    super(message || 'Invalid mime type')
  }
}
