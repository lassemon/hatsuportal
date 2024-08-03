import { Knex } from 'knex'
import { IDataAccessProvider } from '@hatsuportal/platform'
import { KnexQueryBuilder } from './KnexQueryBuilder'
import { KnexTransactionProvider } from '../database/connection'

/**
 * Knex implementation of IDataAccessProvider.
 * Wraps Knex connection pool for non-transactional database operations.
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
      const trxProvider = new KnexTransactionProvider(knexTrx)
      return work(trxProvider)
    })
  }
}
