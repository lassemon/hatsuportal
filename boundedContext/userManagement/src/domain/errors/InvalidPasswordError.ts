import { DomainError } from '@hatsuportal/foundation'

export class InvalidPasswordError extends DomainError {
  constructor(message?: unknown) {
    super(message || 'Invalid password')
  }
}
