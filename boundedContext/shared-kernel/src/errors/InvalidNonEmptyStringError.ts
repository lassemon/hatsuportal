import { DomainError } from '@hatsuportal/foundation'

export class InvalidNonEmptyStringError extends DomainError {
  constructor(message?: unknown) {
    super(message || 'Invalid non empty string')
  }
}
