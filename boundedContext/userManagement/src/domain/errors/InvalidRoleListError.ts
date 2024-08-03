import { DomainError } from '@hatsuportal/common-bounded-context'

export class InvalidRoleListError extends DomainError {
  constructor(message?: unknown) {
    super(message || 'Invalid role list')
  }
}
