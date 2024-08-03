import ApplicationError from '../../application/errors/ApplicationError'

/**
 * Error thrown when a connection to a database or external service fails.
 * This is a cross-cutting concern that should be shared across bounded contexts.
 */
export class ConnectionError extends ApplicationError {
  constructor(message?: unknown) {
    super(message || 'Connection error')
  }
}
