import DomainError from './DomainError'

export class InvalidUserNameError extends DomainError {
  constructor(message?: string) {
    super(message)
  }
}
