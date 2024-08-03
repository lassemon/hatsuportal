import { DomainError } from '@hatsuportal/common-bounded-context'

export class InvalidPostPropertyError extends DomainError {
  constructor(message?: unknown) {
    super(message || 'Invalid post property')
  }
}
