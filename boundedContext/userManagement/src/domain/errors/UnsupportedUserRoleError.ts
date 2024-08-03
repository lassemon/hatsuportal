import { DomainError } from '@hatsuportal/common-bounded-context'

export class UnsupportedUserRoleError extends DomainError {
  constructor(message?: unknown) {
    super(message || 'Unsupported user role')
  }
}

export default UnsupportedUserRoleError
