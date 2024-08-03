import { DomainError } from '@hatsuportal/foundation'

export class InvalidUnixTimestampError extends DomainError {
  constructor(message?: unknown) {
    super(message || 'Invalid unix timestamp')
  }
}
