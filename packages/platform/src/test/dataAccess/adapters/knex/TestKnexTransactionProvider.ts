import { Knex } from 'knex'
import { IDataAccessProvider } from '../../../../application/dataAccess/IDataAccessProvider'
import { ITransaction } from '../../../../application/dataAccess/ITransaction'
import { TestKnexQueryBuilder } from './TestKnexQueryBuilder'

export class TestKnexTransactionProvider implements ITransaction {
  constructor(private readonly knexTransaction: Knex.Transaction) {}

  async commit<T>(payload?: T): Promise<void> {
    await this.knexTransaction.commit(payload)
  }

  async rollback(reason?: unknown): Promise<void> {
    await this.knexTransaction.rollback(reason)
  }

  isCompleted(): boolean {
    return this.knexTransaction.isCompleted()
  }

  table<TRecord extends {} = Record<string, unknown>>(tableName: string): TestKnexQueryBuilder<TRecord> {
    return new TestKnexQueryBuilder(this.knexTransaction(tableName))
  }

  raw(sql: string, bindings: unknown[]): unknown {
    return this.knexTransaction.raw(sql, bindings)
  }

  async transaction<T>(work: (trx: IDataAccessProvider) => Promise<T>): Promise<T> {
    return this.knexTransaction.transaction(async (knexTrx) => {
      const nestedProvider = new TestKnexTransactionProvider(knexTrx)
      return work(nestedProvider)
    })
  }
}
