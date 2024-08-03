import { KnexTransactionProvider } from './connection'
import { Knex } from 'knex'
import {
  ConcurrencyError,
  DataPersistenceError,
  IDataConnectionProvider,
  IDomainEventRepository,
  ITransactionAware,
  ITransactionManager
} from '@hatsuportal/platform'
import { IDomainEventHolder, UniqueId, UnixTimestamp } from '@hatsuportal/shared-kernel'
import { IDomainEventService } from '@hatsuportal/platform/src/application/services/IDomainEventService'

export class UnitOfWork implements ITransactionManager<UniqueId, UnixTimestamp> {
  constructor(
    private readonly domainEventRepository: IDomainEventRepository & ITransactionAware,
    private readonly domainEventService: IDomainEventService,
    private readonly connectionProvider: IDataConnectionProvider<Knex>
  ) {}

  async execute<T extends Array<IDomainEventHolder<UniqueId, UnixTimestamp> | null>>(
    work: () => Promise<[...T]>,
    repositories: ITransactionAware[] = []
  ): Promise<[...T]> {
    const connection = this.connectionProvider.getConnection()

    return await connection.transaction(async (knexTransaction) => {
      const transaction = new KnexTransactionProvider(knexTransaction)

      this.domainEventRepository.setTransaction(transaction)
      repositories.forEach((repo) => repo.setTransaction(transaction))

      try {
        const domainEventHolders = await work()

        await this.domainEventService.persistToOutbox(domainEventHolders)

        domainEventHolders.forEach((holder) => holder && holder.clearEvents())

        return domainEventHolders
      } catch (error) {
        if (!transaction.isCompleted()) {
          await transaction.rollback(error)
        }
        if (error instanceof ConcurrencyError) {
          throw error
        }
        throw new DataPersistenceError({ message: 'Transaction failed', cause: error })
      } finally {
        this.domainEventRepository.setTransaction(null)
        repositories.forEach((repo) => {
          repo.setTransaction(null)
          repo.clearLastLoadedMap()
        })
      }
    })
  }
}
