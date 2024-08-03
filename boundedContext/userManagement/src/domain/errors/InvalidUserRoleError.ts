import { DomainError } from '@hatsuportal/shared-kernel'

export class InvalidUserRoleError extends DomainError {
  constructor(message?: unknown) {
    super(message || 'Invalid user role')
  }
}
