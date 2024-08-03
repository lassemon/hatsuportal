import { DomainError } from '@hatsuportal/shared-kernel'

export class CannotReplaceNonStagedVersionError extends DomainError {
  constructor(message?: unknown) {
    super(message || 'Cannot replace non-staged version')
  }
}
