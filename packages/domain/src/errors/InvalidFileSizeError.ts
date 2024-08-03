import DomainError from './DomainError'

export class InvalidFileSizeError extends DomainError {
  constructor(message?: string) {
    super(message)
  }
}
