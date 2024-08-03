import { DomainError } from '@hatsuportal/common-bounded-context'

export class InvalidUserNameError extends DomainError {
  constructor(message?: unknown) {
    super(message || 'Invalid user name')
  }
}
