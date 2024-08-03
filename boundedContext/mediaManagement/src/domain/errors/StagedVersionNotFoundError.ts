import { DomainError } from '@hatsuportal/shared-kernel'

export class StagedVersionNotFoundError extends DomainError {
  constructor(message?: unknown) {
    super(message || 'Staged version not found')
  }
}
