import { DomainError } from '@hatsuportal/shared-kernel'

export class InvalidImageStorageKeyError extends DomainError {
  constructor(message?: unknown) {
    super(message || 'Invalid image storage key')
  }
}
