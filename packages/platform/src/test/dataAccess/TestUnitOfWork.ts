import type { Knex } from 'knex'
import { flattenDomainEventsFromHolders } from '../../utils/flattenDomainEventsFromHolders'
import {
  ApplicationError,
  DataPersistenceError,
  IDataConnectionProvider,
  IDomainEventService,
  ITransactionContext,
  ITransactionScope,
  IUnitOfWork
} from '../../index'
import { DomainError, IDomainEventHolder } from '@hatsuportal/shared-kernel'
import { Logger } from '@hatsuportal/platform'
import { TestKnexTransactionProvider } from './adapters/knex/TestKnexTransactionProvider'

const logger = new Logger('TestUnitOfWork')

export class TestUnitOfWork implements IUnitOfWork {
  constructor(
    private readonly domainEventService: IDomainEventService,
    private readonly connectionProvider: IDataConnectionProvider<Knex>,
    private readonly transactionContext: ITransactionContext
  ) {}

  async execute<T extends Array<IDomainEventHolder | null>>(work: () => Promise<[...T]>): Promise<[...T]> {
    const activeScope = this.transactionContext.getScope()

    if (activeScope) {
      this.transactionContext.requireActiveScope()

      try {
        const nestedEventHolders = await work()
        this.transactionContext.addEventHolders(nestedEventHolders)
        return nestedEventHolders
      } catch (error) {
        this.transactionContext.markRollbackOnly(error)
        throw error
      }
    }

    let rootScope: ITransactionScope | undefined

    try {
      const connection = this.connectionProvider.getConnection()
      const result = await connection.transaction(async (knexTransaction) => {
        const scope = this.createScope(new TestKnexTransactionProvider(knexTransaction))
        rootScope = scope

        return await this.transactionContext.run(scope, async () => {
          const rootEventHolders = await work()
          this.transactionContext.addEventHolders(rootEventHolders)

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

  private createScope(transaction: TestKnexTransactionProvider): ITransactionScope {
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
