import { DomainError } from '@hatsuportal/shared-kernel'

export class InactiveUserCannotChangePreferencesError extends DomainError {
  constructor(message?: unknown) {
    super(message || 'Inactive users cannot change preferences')
  }
}
