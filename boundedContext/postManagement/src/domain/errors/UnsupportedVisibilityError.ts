import { DomainError } from '@hatsuportal/foundation'

class UnsupportedVisibilityError extends DomainError {
  constructor(message?: unknown) {
    super(message || 'Unsupported visibility')
  }
}

export default UnsupportedVisibilityError
