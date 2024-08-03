import { DomainError } from '@hatsuportal/shared-kernel'

export class InvalidRoleListError extends DomainError {
  constructor(message?: unknown) {
    super(message || 'Invalid role list')
  }
}
