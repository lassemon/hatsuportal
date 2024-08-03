import { DomainError } from '@hatsuportal/shared-kernel'

class UnsupportedVisibilityError extends DomainError {
  constructor(message?: unknown) {
    super(message || 'Unsupported visibility')
  }
}

export default UnsupportedVisibilityError
