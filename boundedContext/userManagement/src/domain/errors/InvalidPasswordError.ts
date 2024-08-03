import { DomainError } from '@hatsuportal/common-bounded-context'

export class InvalidPasswordError extends DomainError {
  constructor(message?: unknown) {
    super(message || 'Invalid password')
  }
}
