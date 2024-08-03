import { Maybe } from '@hatsuportal/common'
import { DataPersistenceError } from '../errors/DataPersistenceError'

/**
 * Error thrown when data persistence operations fail into a concurrency problem (e.g. when the data has been modified by another user).
 * This is a cross-cutting concern that should be shared across bounded contexts.
 */
export class ConcurrencyError<T> extends DataPersistenceError {
  public readonly entity: Maybe<T>

  constructor(message?: unknown, entity: Maybe<T> = null) {
    super(message || 'Concurrency error')
    this.entity = entity
  }
}
