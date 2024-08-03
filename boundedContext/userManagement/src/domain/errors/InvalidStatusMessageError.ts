import { DomainError } from '@hatsuportal/shared-kernel'

export class InvalidStatusMessageError extends DomainError {
  constructor(message?: unknown) {
    super(message || 'Status message is not valid')
  }
}
