import DomainError from './DomainError'

class UnsupportedOrderError extends DomainError {
  constructor(public readonly code: string) {
    super()
  }
}

export default UnsupportedOrderError
