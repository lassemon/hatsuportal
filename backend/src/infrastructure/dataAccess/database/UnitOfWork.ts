import { KnexTransactionProvider } from './connection'
import { Knex } from 'knex'
import {
  ApplicationError,
  DataPersistenceError,
  IDataConnectionProvider,
  ITransactionContext,
  IUnitOfWork,
  ITransactionScope
} from '@hatsuportal/platform'
import { DomainError, IDomainEventHolder } from '@hatsuportal/shared-kernel'
import { flattenDomainEventsFromHolders, IDomainEventService } from '@hatsuportal/platform'
import { Logger } from '@hatsuportal/platform'

const logger = new Logger('UnitOfWork')

/**
 * Knex-backed {@link IUnitOfWork} that coordinates database writes, domain-event
 * outbox persistence, and compensating rollback actions within a single transaction
 * boundary.
 *
 * ## Purpose
 *
 * Application use cases call {@link UnitOfWork.execute} to run repository work
 * atomically. On success the root transaction commits and collected domain events
 * are written to the outbox; on failure the transaction rolls back and optional
 * {@link ITransactionContext.registerAfterRollback} callbacks run (for example,
 * deleting files uploaded before the DB transaction started).
 *
 * The active transaction scope is published through {@link ITransactionContext}
 * (AsyncLocalStorage) so repositories and helpers automatically use the same
 * Knex transaction without passing it explicitly.
 *
 * ## Usage
 *
 * Inject `IUnitOfWork` in use cases and wrap mutating work in `execute`. Return
 * every entity that emitted domain events so they can be flushed after commit:
 *
 * ```ts
 * await this.unitOfWork.execute(async () => {
 *   await this.repository.save(entity)
 *   return [entity]
 * })
 * ```
 *
 * Nested `execute()` calls on the same call stack reuse the outer transaction
 * instead of opening a new one. A failure in a nested call marks the root scope
 * rollback-only so the outer transaction aborts.
 *
 * NOTE: If you make changes to this file, reflect them in the platform package TestUnitOfWork.ts as well!
 */
export class UnitOfWork implements IUnitOfWork {
  /**
   * @param domainEventService Persists collected domain events to the outbox after a successful commit.
   * @param connectionProvider Supplies the Knex connection used to open the root transaction.
   * @param transactionContext Publishes the active scope to repositories and tracks event holders,
   *   rollback-only state, optimistic-lock baselines, and compensating callbacks.
   */
  constructor(
    private readonly domainEventService: IDomainEventService,
    private readonly connectionProvider: IDataConnectionProvider<Knex>,
    private readonly transactionContext: ITransactionContext
  ) {}

  /**
   * Runs `work` inside a DB transaction.
   *
   * - **Root call** — opens a Knex transaction, exposes the scope via
   *   {@link ITransactionContext.run}, persists domain events on success, and runs
   *   rollback callbacks if the transaction fails.
   * - **Nested call** — joins the active scope instead of opening a second
   *   transaction; failures are propagated via {@link ITransactionContext.markRollbackOnly}.
   *
   * @param work Async callback that performs repository mutations. Must return a tuple of
   *   {@link IDomainEventHolder} instances (or `null`) for every entity that raised domain
   *   events during the work.
   * @returns The same tuple returned by `work`.
   * @throws Re-throws {@link ApplicationError} and {@link DomainError} unchanged; wraps other
   *   failures in {@link DataPersistenceError}.
   */
  async execute<T extends Array<IDomainEventHolder | null>>(work: () => Promise<[...T]>): Promise<[...T]> {
    const activeScope = this.transactionContext.getScope()

    // Nested: caller is already inside a root transaction — reuse it.
    if (activeScope) {
      this.transactionContext.requireActiveScope()

      try {
        const nestedEventHolders = await work()
        this.transactionContext.addEventHolders(nestedEventHolders)
        return nestedEventHolders
      } catch (error) {
        // Root will check rollbackOnly before commit; no outbox or rollback callbacks here.
        this.transactionContext.markRollbackOnly(error)
        throw error
      }
    }

    // Root: open the first Knex transaction for this call stack.
    let rootScope: ITransactionScope | undefined

    try {
      const connection = this.connectionProvider.getConnection()
      const result = await connection.transaction(async (knexTransaction) => {
        const scope = this.createScope(new KnexTransactionProvider(knexTransaction))
        rootScope = scope

        // Makes scope visible to repositories and registerAfterRollback via AsyncLocalStorage.
        return await this.transactionContext.run(scope, async () => {
          const rootEventHolders = await work()
          this.transactionContext.addEventHolders(rootEventHolders)

          // Nested execute() may have failed without reaching this line's throw yet.
          if (scope.rollbackOnly) {
            throw scope.rollbackError
          }

          const events = flattenDomainEventsFromHolders(scope.eventHolders)
          await this.domainEventService.persistEvents(events)
          return rootEventHolders
        })
      })

      rootScope?.eventHolders.forEach((holder) => holder?.clearEvents())
      return result
    } catch (error) {
      // e.g. delete files uploaded in prepare* before the DB transaction started or other similar compensating actions
      if (rootScope) {
        await this.runRollbackCallbacks(rootScope)
      }
      if (error instanceof ApplicationError || error instanceof DomainError) {
        throw error
      }
      throw new DataPersistenceError({ message: 'Transaction failed', cause: error })
    } finally {
      if (rootScope) {
        rootScope.state = 'completed'
      }
    }
  }

  private createScope(transaction: KnexTransactionProvider): ITransactionScope {
    return {
      transaction,
      eventHolders: new Set(),
      rollbackCallbacks: [],
      expectedUpdatedAtByKey: new Map(),
      state: 'active',
      rollbackOnly: false,
      rollbackError: null
    }
  }

  private async runRollbackCallbacks(scope: ITransactionScope): Promise<void> {
    for (const callback of scope.rollbackCallbacks) {
      try {
        await callback()
      } catch (callbackError) {
        logger.error('Rollback callback failed', callbackError)
      }
    }
  }
}
