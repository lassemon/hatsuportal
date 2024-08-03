import DomainError from './DomainError'

export class UnsupportedPostTypeError extends DomainError {
  constructor(public readonly code: string) {
    super()
  }
}
