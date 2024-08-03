import { DomainError } from '@hatsuportal/shared-kernel'

export class InvalidUserActivePropertyError extends DomainError {
  constructor(message?: unknown) {
    super(message || 'Invalid user active property')
  }
}
