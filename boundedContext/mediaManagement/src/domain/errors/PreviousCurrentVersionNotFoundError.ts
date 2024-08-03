import { DomainError } from '@hatsuportal/shared-kernel'

export class PreviousCurrentVersionNotFoundError extends DomainError {
  constructor(message?: unknown) {
    super(message || 'Previous current version not found')
  }
}
