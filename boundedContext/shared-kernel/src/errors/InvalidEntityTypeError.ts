import { DomainError } from '@hatsuportal/foundation'

export class InvalidEntityTypeError extends DomainError {
  constructor(message?: unknown) {
    super(message || 'Invalid entity type')
  }
}
