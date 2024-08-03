import { DomainError } from '@hatsuportal/shared-kernel'

export class StagedStorageKeyMismatchError extends DomainError {
  constructor(message?: unknown) {
    super(message || 'Staged storage key mismatch')
  }
}
