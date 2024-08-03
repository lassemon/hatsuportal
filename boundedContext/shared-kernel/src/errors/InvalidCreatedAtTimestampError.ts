import { DomainError } from './DomainError'

export class InvalidCreatedAtTimestampError extends DomainError {
  constructor(message?: unknown) {
    super(message || 'Invalid created at timestamp')
  }
}
