import { DomainError } from '@hatsuportal/foundation'

export class UnsupportedUserRoleError extends DomainError {
  constructor(message?: unknown) {
    super(message || 'Unsupported user role')
  }
}

export default UnsupportedUserRoleError
