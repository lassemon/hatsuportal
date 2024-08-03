import { DomainError } from '@hatsuportal/shared-kernel'

export class CurrentVersionNotFoundError extends DomainError {
  constructor(message?: unknown) {
    super(message || 'Current version not found')
  }
}
