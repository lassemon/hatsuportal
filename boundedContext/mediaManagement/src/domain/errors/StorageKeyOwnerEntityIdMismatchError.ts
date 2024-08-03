import { DomainError } from '@hatsuportal/shared-kernel'

export class StorageKeyOwnerEntityIdMismatchError extends DomainError {
  constructor(message?: unknown) {
    super(message || 'Storage key owner entity id mismatch')
  }
}
