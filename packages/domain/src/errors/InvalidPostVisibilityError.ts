import DomainError from './DomainError'

export class InvalidPostVisibilityError extends DomainError {
  constructor(message?: string) {
    super(message)
  }
}
