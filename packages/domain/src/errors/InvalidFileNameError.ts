import DomainError from './DomainError'

export class InvalidFileNameError extends DomainError {
  constructor(message?: string) {
    super(message)
  }
}
