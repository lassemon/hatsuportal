import DomainError from './DomainError'

export class InvalidPostPropertyError extends DomainError {
  constructor(message?: string) {
    super(message)
  }
}
