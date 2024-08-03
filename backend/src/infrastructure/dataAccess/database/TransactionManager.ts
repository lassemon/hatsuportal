import { ITransactionManager, DataPersistenceError, IRepository } from '@hatsuportal/common-bounded-context'
import { KnexTransaction } from './connection'
import { IDatabaseConnectionProvider } from './IDatabaseConnectionProvider'
import { Knex } from 'knex'

export class TransactionManager implements ITransactionManager {
  constructor(private readonly connectionProvider: IDatabaseConnectionProvider<Knex>) {}

  async execute<T>(operation: () => Promise<T>, repositories: IRepository[] = []): Promise<T> {
    const connection = await this.connectionProvider.getConnection()

    return await connection.transaction(async (knexTransaction) => {
      const transaction = new KnexTransaction(knexTransaction)

      repositories.forEach((repo) => repo.setTransaction(transaction))

      try {
        const result = await operation()
        if (!transaction.isCompleted()) {
          await transaction.commit(result)
        }
        return result
      } catch (error) {
        if (!transaction.isCompleted()) {
          await transaction.rollback(error)
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
}
