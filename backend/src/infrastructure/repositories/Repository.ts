import { ITransaction, IRepository, UnixTimestamp, DataPersistenceError } from '@hatsuportal/common-bounded-context'
import { Knex } from 'knex'
import connection, { KnexTransaction } from '../dataAccess/database/connection'

export class Repository implements IRepository {
  protected transaction: ITransaction | null = null
  protected lastLoadedMap: Map<string, UnixTimestamp> = new Map()

  protected constructor(protected readonly tableName: string) {}

  setTransaction(transaction: ITransaction | null): void {
    this.transaction = transaction
  }

  /** Re-root Knex calls either inside the current transaction or the singleton pool */
  protected async getConnection(): Promise<Knex | Knex.Transaction> {
    if (this.transaction instanceof KnexTransaction) {
      return this.transaction.underlying
    }
    return connection.getConnection()
  }

  clearLastLoadedMap(): void {
    this.lastLoadedMap.clear()
  }

  throwDataPersistenceError = (error: unknown) => {
    if (error instanceof Error) {
      throw new DataPersistenceError({ message: error.message || 'UnknownError', cause: error })
    } else {
      throw new DataPersistenceError({ message: 'UnknownError', cause: error })
    }
  }
}
