import { DomainError } from '@hatsuportal/shared-kernel'

export class UserNameTooLongError extends DomainError {
  constructor(message?: unknown) {
    super(message || 'User name is too long')
  }
}
