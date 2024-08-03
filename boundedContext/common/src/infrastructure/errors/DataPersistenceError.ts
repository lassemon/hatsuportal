import ApplicationError from '../../application/errors/ApplicationError'

/**
 * Error thrown when data persistence operations fail.
 * This is a cross-cutting concern that should be shared across bounded contexts.
 */

// TODO, why does an infrastcuture error extend an application error?
export class DataPersistenceError extends ApplicationError {
  constructor(message?: unknown) {
    super(message || 'Data persistence operation failed')
  }
}
