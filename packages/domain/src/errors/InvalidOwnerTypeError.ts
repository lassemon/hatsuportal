import DomainError from './DomainError'

export class InvalidOwnerTypeError extends DomainError {
  constructor(message?: string) {
    super(message)
  }
}
