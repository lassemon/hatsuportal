import { DomainError } from '@hatsuportal/common-bounded-context'

export class InvalidUserPropertyError extends DomainError {
  constructor(message?: unknown) {
    super(message || 'Invalid user property')
  }
}
