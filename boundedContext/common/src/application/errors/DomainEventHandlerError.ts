import ApplicationError from './ApplicationError'

export class DomainEventHandlerError extends ApplicationError {
  constructor(message?: unknown) {
    super(message || 'Domain event handler error')
  }
}
