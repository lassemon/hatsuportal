import { DomainError } from '@hatsuportal/foundation'

export class InvalidEmailError extends DomainError {
  constructor(message?: unknown) {
    super(message || 'Invalid email')
  }
}
