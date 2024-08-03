import DomainError from './DomainError'

export class InvalidBase64ImageError extends DomainError {
  constructor(message?: unknown) {
    super(message || 'Invalid base64 image')
  }
}
