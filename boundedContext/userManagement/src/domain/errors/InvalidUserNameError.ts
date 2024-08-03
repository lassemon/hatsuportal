import { DomainError } from '@hatsuportal/foundation'

export class InvalidUserNameError extends DomainError {
  constructor(message?: unknown) {
    super(message || 'Invalid user name')
  }
}
