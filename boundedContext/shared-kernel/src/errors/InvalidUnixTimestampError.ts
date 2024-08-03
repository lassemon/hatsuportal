import DomainError from './DomainError'

export class InvalidUnixTimestampError extends DomainError {
  constructor(message?: unknown) {
    super(message || 'Invalid unix timestamp')
  }
}
