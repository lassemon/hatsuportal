import DomainError from './DomainError'

export class InvalidUserValueError extends DomainError {
  constructor(message?: string) {
    super(message)
  }
}
