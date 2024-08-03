import { DomainError } from '@hatsuportal/shared-kernel'

export class UnsupportedUserRoleError extends DomainError {
  constructor(message?: unknown) {
    super(message || 'Unsupported user role')
  }
}

export default UnsupportedUserRoleError
