import { DomainError } from '@hatsuportal/shared-kernel'

export class InvalidDomainOperationError extends DomainError {
  constructor(message?: unknown) {
    super(message || 'Invalid domain operation')
  }
}

export default InvalidDomainOperationError
