import { DomainError } from '@hatsuportal/shared-kernel'

export class InvalidPasswordError extends DomainError {
  constructor(message?: unknown) {
    super(message || 'Invalid password')
  }
}
