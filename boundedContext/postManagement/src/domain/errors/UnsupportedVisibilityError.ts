import { DomainError } from '@hatsuportal/common-bounded-context'

class UnsupportedVisibilityError extends DomainError {
  constructor(message?: unknown) {
    super(message || 'Unsupported visibility')
  }
}

export default UnsupportedVisibilityError
