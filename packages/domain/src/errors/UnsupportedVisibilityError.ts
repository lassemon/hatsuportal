import DomainError from './DomainError'

class UnsupportedVisibilityError extends DomainError {
  constructor(public readonly code: string) {
    super()
  }
}

export default UnsupportedVisibilityError
