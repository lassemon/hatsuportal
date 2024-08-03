import { DomainError } from '@hatsuportal/common-bounded-context'

export class InvalidOwnerTypeError extends DomainError {
  constructor(message?: unknown) {
    super(message || 'Invalid owner type')
  }
}
