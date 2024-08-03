import { DomainError } from '@hatsuportal/shared-kernel'

export class InvalidEmailError extends DomainError {
  constructor(message?: unknown) {
    super(message || 'Invalid email')
  }
}
