import { DomainError } from '@hatsuportal/foundation'

export class InvalidDomainOperationError extends DomainError {
  constructor(message?: unknown) {
    super(message || 'Invalid domain operation')
  }
}

export default InvalidDomainOperationError
