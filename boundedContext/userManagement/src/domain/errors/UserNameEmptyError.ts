import { DomainError } from '@hatsuportal/shared-kernel'

export class UserNameEmptyError extends DomainError {
  constructor(message?: unknown) {
    super(message || 'User name cannot be empty')
  }
}
