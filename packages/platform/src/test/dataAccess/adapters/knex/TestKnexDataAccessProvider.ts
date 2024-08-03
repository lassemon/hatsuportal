import { Knex } from 'knex'
import { IDataAccessProvider } from '../../../../application/dataAccess/IDataAccessProvider'
import { TestKnexQueryBuilder } from './TestKnexQueryBuilder'
import { TestKnexTransactionProvider } from './TestKnexTransactionProvider'

export class TestKnexDataAccessProvider implements IDataAccessProvider {
  constructor(private readonly knex: Knex) {}

  table<TRecord extends {} = Record<string, unknown>>(tableName: string): TestKnexQueryBuilder<TRecord> {
    return new TestKnexQueryBuilder(this.knex(tableName))
  }

  raw(sql: string, bindings: unknown[]): unknown {
    return this.knex.raw(sql, bindings)
  }

  async transaction<T>(work: (trx: IDataAccessProvider) => Promise<T>): Promise<T> {
    return this.knex.transaction(async (knexTrx) => {
      const transactionProvider = new TestKnexTransactionProvider(knexTrx)
      return work(transactionProvider)
    })
  }
}
