import { DomainError } from '@hatsuportal/shared-kernel'

export class StatusMessageTooLongError extends DomainError {
  constructor(message?: unknown) {
    super(message || 'Status message is too long')
  }
}
