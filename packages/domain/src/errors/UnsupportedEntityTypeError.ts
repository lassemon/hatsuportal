import DomainError from './DomainError'

class UnsupportedEntityTypeError extends DomainError {
  constructor(public readonly code: string) {
    super()
  }
}

export default UnsupportedEntityTypeError
