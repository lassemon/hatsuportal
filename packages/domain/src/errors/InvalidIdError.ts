import DomainError from './DomainError'

export class InvalidIdError extends DomainError {
  constructor(message?: string) {
    super(message)
  }
}
