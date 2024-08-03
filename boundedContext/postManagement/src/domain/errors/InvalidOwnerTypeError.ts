import { DomainError } from '@hatsuportal/foundation'

export class InvalidOwnerTypeError extends DomainError {
  constructor(message?: unknown) {
    super(message || 'Invalid owner type')
  }
}
