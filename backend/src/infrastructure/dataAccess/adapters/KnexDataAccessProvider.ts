import { Knex } from 'knex'
import { IDataAccessProvider } from '@hatsuportal/platform'
import { KnexQueryBuilder } from './KnexQueryBuilder'
import { KnexTransactionProvider } from '../database/connection'

/**
 * Knex implementation of IDataAccessProvider.
 * Wraps Knex connection pool for non-transactional database operations.
 * NOTE: If you make changes to this file, reflect them in the platform package TestKnexDataAccessProvider.ts as well!
 */
export class KnexDataAccessProvider implements IDataAccessProvider {
  constructor(private readonly knex: Knex) {}

  table<TRecord extends {} = any>(tableName: string): KnexQueryBuilder<TRecord> {
    return new KnexQueryBuilder(this.knex(tableName))
  }

  raw(sql: string, bindings: any[]): any {
    return this.knex.raw(sql, bindings)
  }

  async transaction<T>(work: (trx: IDataAccessProvider) => Promise<T>): Promise<T> {
    return this.knex.transaction(async (knexTrx) => {
      const transactionProvider = new KnexTransactionProvider(knexTrx)
      return work(transactionProvider)
    })
  }
}
