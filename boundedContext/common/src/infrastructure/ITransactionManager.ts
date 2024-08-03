import { IRepository } from './IRepository'

/**
 * Generic transaction manager interface for coordinating database operations.
 * This is a cross-cutting concern that should be shared across bounded contexts.
 */
export interface ITransactionManager {
  /**
   * Executes an operation within a transaction context.
   * The transaction is automatically committed on success or rolled back on failure.
   */
  execute<T>(operation: () => Promise<T>, repositories?: IRepository[]): Promise<T>
}
