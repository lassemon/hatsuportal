import { IDataAccessProvider } from './IDataAccessProvider'

/**
 * Generic transaction interface for database operations.
 * This is a cross-cutting concern that should be shared across bounded contexts.
 */
export interface ITransaction extends IDataAccessProvider {
  commit<T>(payload?: T): Promise<void>
  rollback(reason?: unknown): Promise<void>
  isCompleted(): boolean
}
