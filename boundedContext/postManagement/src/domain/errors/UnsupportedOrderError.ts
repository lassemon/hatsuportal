import { DomainError } from '@hatsuportal/shared-kernel'

class UnsupportedOrderError extends DomainError {
  constructor(message?: unknown) {
    super(message || 'Unsupported order')
  }
}

export default UnsupportedOrderError
