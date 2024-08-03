import { ITransactionAware } from './ITransactionAware'
import { IDomainEventHolder } from '@hatsuportal/shared-kernel'

/**
 * Generic transaction manager interface for coordinating database operations.
 * This is a cross-cutting concern that should be shared across bounded contexts.
 * The transaction manager implements the Unit of Work pattern.
 */
export interface ITransactionManager<IdType, ITimeType = number> {
  /**
   * Executes a unit of work within a transaction context.
   * The transaction is automatically committed on success or rolled back on failure.
   *
   * The unit of work should return a DomainEventHolder.
   * The transaction manager will flush the domain events of the DomainEventHolder after the unit of work is executed.
   *
   * @param work The unit of work to execute within the transaction. MUST return an array of DomainEventHolders containing ALL domain entities sending domain events
   * so that the transaction manager can flush the domain events of the DomainEventHolders after the unit of work is executed.
   * @param repositories The repositories to use within the transaction.
   * @returns The result of the unit of work.
   */
  execute<T extends Array<IDomainEventHolder<IdType, ITimeType> | null>>(
    work: () => Promise<[...T]>,
    repositories?: ITransactionAware[]
  ): Promise<[...T]>
}
