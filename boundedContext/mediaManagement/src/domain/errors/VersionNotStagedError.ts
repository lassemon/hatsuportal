import { DomainError } from '@hatsuportal/shared-kernel'

export class VersionNotStagedError extends DomainError {
  constructor(message?: unknown) {
    super(message || 'Version is not staged')
  }
}
