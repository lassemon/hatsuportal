import DomainError from './DomainError'

export class InvalidMimeTypeError extends DomainError {
  constructor(message?: string) {
    super(message)
  }
}
