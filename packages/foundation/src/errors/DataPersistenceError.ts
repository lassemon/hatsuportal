import ApplicationError from './ApplicationError'

/**
 * Error thrown when data persistence operations fail.
 * This is a cross-cutting concern that should be shared across bounded contexts.
 */

class DataPersistenceError extends ApplicationError {
  constructor(message?: unknown) {
    super(message || 'Data persistence operation failed')
  }
}

export default DataPersistenceError
