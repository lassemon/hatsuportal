import ApplicationError from './ApplicationError'

export class DomainEventHandlerError extends ApplicationError {
  constructor(message?: string) {
    super(message)
  }
}
