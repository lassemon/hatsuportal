import { DomainError } from '@hatsuportal/shared-kernel'

export class InvalidOwnerTypeError extends DomainError {
  constructor(message?: unknown) {
    super(message || 'Invalid owner type')
  }
}
