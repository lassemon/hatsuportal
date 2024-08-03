import { DomainEventHolder } from '../domain/events/DomainEventHolder'
import { IRepository } from './IRepository'

/**
 * Generic transaction manager interface for coordinating database operations.
 * This is a cross-cutting concern that should be shared across bounded contexts.
 * The transaction manager implements the Unit of Work pattern.
 */
export interface ITransactionManager {
  /**
   * Executes a unit of work within a transaction context.
   * The transaction is automatically committed on success or rolled back on failure.
   *
   * The unit of work should return a DomainEventHolder.
   * The transaction manager will flush the domain events of the DomainEventHolder after the unit of work is executed.
   *
   * @param work The unit of work to execute within the transaction.
   * @param repositories The repositories to use within the transaction.
   * @returns The result of the unit of work.
   */
  execute<T extends DomainEventHolder>(work: () => Promise<T>, repositories?: IRepository[]): Promise<T>
}
