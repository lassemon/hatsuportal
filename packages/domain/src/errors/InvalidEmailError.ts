import DomainError from './DomainError'

export class InvalidEmailError extends DomainError {
  constructor(message?: string) {
    super(message)
  }
}
