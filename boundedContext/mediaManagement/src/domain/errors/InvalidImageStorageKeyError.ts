import { DomainError } from '@hatsuportal/foundation'

export class InvalidImageStorageKeyError extends DomainError {
  constructor(message?: unknown) {
    super(message || 'Invalid image storage key')
  }
}
