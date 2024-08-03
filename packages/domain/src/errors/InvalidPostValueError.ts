import DomainError from './DomainError'

export class InvalidPostValueError extends DomainError {
  constructor(message?: string) {
    super(message)
  }
}
