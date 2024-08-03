import { DomainError } from '@hatsuportal/common-bounded-context'

class UnsupportedOrderError extends DomainError {
  constructor(message?: unknown) {
    super(message || 'Unsupported order')
  }
}

export default UnsupportedOrderError
