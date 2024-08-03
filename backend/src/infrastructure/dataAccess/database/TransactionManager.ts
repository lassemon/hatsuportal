import {
  ITransactionManager,
  DataPersistenceError,
  IRepository,
  DomainEventHolder,
  IDomainEventDispatcher,
  ConcurrencyError
} from '@hatsuportal/common-bounded-context'
import { KnexTransaction } from './connection'
import { IDatabaseConnectionProvider } from './IDatabaseConnectionProvider'
import { Knex } from 'knex'
import { Logger } from '@hatsuportal/common'

const logger = new Logger('TransactionManager')
export class TransactionManager implements ITransactionManager {
  constructor(
    private readonly connectionProvider: IDatabaseConnectionProvider<Knex>,
    private readonly eventDispatcher: IDomainEventDispatcher
  ) {}

  async execute<T extends DomainEventHolder>(work: () => Promise<T>, repositories: IRepository[] = []): Promise<T> {
    const connection = await this.connectionProvider.getConnection()

    return await connection.transaction(async (knexTransaction) => {
      const transaction = new KnexTransaction(knexTransaction)

      repositories.forEach((repo) => repo.setTransaction(transaction))

      try {
        const result = await work()
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
        await this.flushDomainEvents(result)
        if (!transaction.isCompleted()) {
          await transaction.commit(result)
        }
        return result
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
  private async flushDomainEvents(eventHolder: DomainEventHolder): Promise<DomainEventHolder> {
    for (const event of eventHolder.domainEvents) {
      logger.debug(`Dispatching event ${event.eventType} for ${eventHolder.id.value}`)
      await this.eventDispatcher.dispatch(event)
    }
    eventHolder.clearEvents()

    return eventHolder
  }
}
