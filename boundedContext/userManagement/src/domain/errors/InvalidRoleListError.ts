import { DomainError } from '@hatsuportal/foundation'

export class InvalidRoleListError extends DomainError {
  constructor(message?: unknown) {
    super(message || 'Invalid role list')
  }
}
