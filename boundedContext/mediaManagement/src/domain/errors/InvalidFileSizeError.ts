import { DomainError } from '@hatsuportal/foundation'

export class InvalidFileSizeError extends DomainError {
  constructor(message?: unknown) {
    super(message || 'Invalid file size')
  }
}
