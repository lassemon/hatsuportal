import { DomainError } from '@hatsuportal/common-bounded-context'

export class InvalidUserRoleError extends DomainError {
  constructor(message?: unknown) {
    super(message || 'Invalid user role')
  }
}
