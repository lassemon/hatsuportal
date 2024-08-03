import DomainError from './DomainError'

export class InvalidBase64ImageError extends DomainError {
  constructor(message?: string) {
    super(message)
  }
}
