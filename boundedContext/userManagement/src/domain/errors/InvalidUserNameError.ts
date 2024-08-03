import { DomainError } from '@hatsuportal/shared-kernel'

export class InvalidUserNameError extends DomainError {
  constructor(message?: unknown) {
    super(message || 'Invalid user name')
  }
}
