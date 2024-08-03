import { DomainError } from '@hatsuportal/common-bounded-context'

export class InvalidEmailError extends DomainError {
  constructor(message?: unknown) {
    super(message || 'Invalid email')
  }
}
