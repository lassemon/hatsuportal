import { KnexTransactionProvider } from './connection'
import { Knex } from 'knex'
import {
  ConcurrencyError,
  DataPersistenceError,
  IDataConnectionProvider,
  ITransactionAware,
  ITransactionManager
} from '@hatsuportal/platform'
import { Logger } from '@hatsuportal/common'
import { IDomainEventDispatcher, IDomainEventHolder, UniqueId, UnixTimestamp } from '@hatsuportal/shared-kernel'

const logger = new Logger('TransactionManager')

export class TransactionManager implements ITransactionManager<UniqueId, UnixTimestamp> {
  constructor(
    private readonly connectionProvider: IDataConnectionProvider<Knex>,
    private readonly eventDispatcher: IDomainEventDispatcher<UnixTimestamp>
  ) {}

  async execute<T extends Array<IDomainEventHolder<UniqueId, UnixTimestamp> | null>>(
    work: () => Promise<[...T]>,
    repositories: ITransactionAware[] = []
  ): Promise<[...T]> {
    const connection = this.connectionProvider.getConnection()

    return await connection.transaction(async (knexTransaction) => {
      const transaction = new KnexTransactionProvider(knexTransaction)

      repositories.forEach((repo) => repo.setTransaction(transaction))

      try {
        const domainEventHolders = await work()
        /* FIXME:
         * Outbox-pattern:
         * TransactionManager does not dispatch.
         * TransactionManager collects all events in an “outbox” table or in-memory list.
         * After the transaction commits successfully, an infrastructure component reads the outbox and publishes the events (possibly asynchronously via message bus).
         * Guarantees atomicity between state change and event publication; avoids failed dispatch leaving domainEvents uncleared. (TODO: implement)
         *
         * Current implementation drawback: only the current aggregate domain events are flushed,
         * if the code modifies other aggregates, the events of those aggregates are not flushed.
         *
         * This TransactionManager assumes all listeners are in-process and rollback-safe.
         * For eventual consistency and comprehensive aggregate event collecting,
         * replace with an outbox pattern. (TODO: implement)
         */
        const flushedEventHolders = await this.flushDomainEvents(domainEventHolders)
        if (!transaction.isCompleted()) {
          await transaction.commit(flushedEventHolders)
        }
        return flushedEventHolders
      } catch (error) {
        if (!transaction.isCompleted()) {
          await transaction.rollback(error)
        }
        if (error instanceof ConcurrencyError) {
          throw error
        }
        throw new DataPersistenceError({ message: 'Transaction failed', cause: error })
      } finally {
        repositories.forEach((repo) => {
          repo.setTransaction(null)
          repo.clearLastLoadedMap()
        })
      }
    })
  }

  /**
   * Flushes the domain events of the event holder.
   * Flushing means dispatching the events and clearing them from the event holder.
   *
   * @param eventHolder The event holder to flush.
   * @returns The event holder with the events flushed.
   */
  private async flushDomainEvents<T extends Array<IDomainEventHolder<UniqueId, UnixTimestamp> | null>>(
    eventHolders: [...T]
  ): Promise<[...T]> {
    for (const eventHolder of eventHolders) {
      if (eventHolder) {
        for (const event of eventHolder.domainEvents) {
          logger.debug(`Dispatching event ${event.eventType} for ${eventHolder.id.value}`)
          await this.eventDispatcher.dispatch(event)
        }
      }
    }
    eventHolders.forEach((eventHolder) => eventHolder && eventHolder.clearEvents())

    return eventHolders
  }
}
