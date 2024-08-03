import { DomainError } from '@hatsuportal/foundation'

class UnsupportedOrderError extends DomainError {
  constructor(message?: unknown) {
    super(message || 'Unsupported order')
  }
}

export default UnsupportedOrderError
