import DomainError from './DomainError'

export class InvalidUserPropertyError extends DomainError {
  constructor(message?: string) {
    super(message)
  }
}
