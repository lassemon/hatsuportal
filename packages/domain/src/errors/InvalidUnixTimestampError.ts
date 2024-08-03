import DomainError from './DomainError'

export class InvalidUnixTimestampError extends DomainError {
  constructor(message?: string) {
    super(message)
  }
}
