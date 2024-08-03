import { IDomainEventHolder } from '@hatsuportal/shared-kernel'

/**
 * Unit of Work interface for coordinating database operations within a transaction.
 * This is a cross-cutting concern shared across bounded contexts.
 */
export interface IUnitOfWork<IdType, ITimeType = number> {
  /**
   * Executes work within a transaction context.
   * The transaction is automatically committed on success or rolled back on failure.
   *
   * Work should return domain event holders so their events can be flushed to the outbox
   * after the transaction commits successfully.
   *
   * @param work The work to execute within the transaction. MUST return an array of
   * DomainEventHolders containing ALL domain entities emitting domain events.
   * @returns The result of the work.
   */
  execute<T extends Array<IDomainEventHolder<IdType, ITimeType> | null>>(work: () => Promise<[...T]>): Promise<[...T]>
}
