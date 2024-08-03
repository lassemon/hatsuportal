import { ApplicationError } from '@hatsuportal/foundation'

export class DomainEventHandlerError extends ApplicationError {
  constructor(message?: unknown) {
    super(message || 'Domain event handler error')
  }
}
