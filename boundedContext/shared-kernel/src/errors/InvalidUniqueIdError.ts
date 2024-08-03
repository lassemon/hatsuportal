import { DomainError } from '@hatsuportal/foundation'

export class InvalidUniqueIdError extends DomainError {
  constructor(message?: unknown) {
    super(message || 'Invalid unique id')
  }
}
