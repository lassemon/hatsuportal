import DomainError from './DomainError'

export class InvalidPasswordError extends DomainError {
  constructor(message?: string) {
    super(message)
  }
}
