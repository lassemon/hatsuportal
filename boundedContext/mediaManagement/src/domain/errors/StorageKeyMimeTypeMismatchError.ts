import { DomainError } from '@hatsuportal/shared-kernel'

export class StorageKeyMimeTypeMismatchError extends DomainError {
  constructor(message?: unknown) {
    super(message || 'Storage key mime type mismatch')
  }
}
