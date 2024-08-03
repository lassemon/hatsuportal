import { DomainError } from '@hatsuportal/foundation'

export class InvalidUserRoleError extends DomainError {
  constructor(message?: unknown) {
    super(message || 'Invalid user role')
  }
}
