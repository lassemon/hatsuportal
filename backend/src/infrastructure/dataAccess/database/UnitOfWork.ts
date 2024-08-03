import { KnexTransactionProvider } from './connection'
import { Knex } from 'knex'
import {
  ConcurrencyError,
  DataPersistenceError,
  IDataConnectionProvider,
  ITransactionContext,
  IUnitOfWork,
  ITransactionScope
} from '@hatsuportal/platform'
import { IDomainEventHolder, UniqueId, UnixTimestamp } from '@hatsuportal/shared-kernel'
import { IDomainEventService } from '@hatsuportal/platform/src/application/services/IDomainEventService'
import { Logger } from '@hatsuportal/common'

const logger = new Logger('UnitOfWork')

export class UnitOfWork implements IUnitOfWork<UniqueId, UnixTimestamp> {
  constructor(
    private readonly domainEventService: IDomainEventService,
    private readonly connectionProvider: IDataConnectionProvider<Knex>,
    private readonly transactionContext: ITransactionContext
  ) {}

  /**
   * Runs `work` inside a DB transaction. Nested calls join the active scope instead of
   * opening a second transaction (see the two branches below — only one runs per call).
   */
  async execute<T extends Array<IDomainEventHolder<UniqueId, UnixTimestamp> | null>>(work: () => Promise<[...T]>): Promise<[...T]> {
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

          await this.domainEventService.persistToOutbox([...scope.eventHolders])
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
      if (error instanceof ConcurrencyError) {
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
