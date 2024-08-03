import { DomainError } from '@hatsuportal/shared-kernel'

export class VersionIdMustDifferError extends DomainError {
  constructor(message?: unknown) {
    super(message || 'Version id must differ from original')
  }
}
