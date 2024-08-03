import { Knex, knex } from 'knex'
import { knexSnakeCaseMappers } from 'objection'
import { types as pgTypes } from 'pg'
import { ConnectionError, IDataAccessProvider, IDataConnectionProvider, ITransaction } from '@hatsuportal/platform'
import { KnexQueryBuilder } from '../adapters/KnexQueryBuilder'

pgTypes.setTypeParser(20, (val: string) => parseInt(val, 10))

export class ConnectionProvider implements IDataConnectionProvider<Knex> {
  getConnection(): Knex {
    return Connection.getConnection() // reuse singleton internally
  }
}
/**
 * Knex implementation of ITransaction.
 * Provides both transaction control (commit/rollback) and query execution capabilities.
 */
export class KnexTransactionProvider implements ITransaction {
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

  // IDataAccessProvider methods (query execution)
  table<TRecord extends {} = any>(tableName: string): KnexQueryBuilder<TRecord> {
    return new KnexQueryBuilder(this.knexTransaction(tableName))
  }

  raw(sql: string, bindings: any[]): any {
    return this.knexTransaction.raw(sql, bindings)
  }

  async transaction<T>(work: (trx: IDataAccessProvider) => Promise<T>): Promise<T> {
    // Nested transaction - Knex uses savepoints
    return this.knexTransaction.transaction(async (knexTrx) => {
      const nestedProvider = new KnexTransactionProvider(knexTrx)
      return work(nestedProvider)
    })
  }

  /*get underlying(): Knex.Transaction {
    return this.knexTransaction
  }*/
}

class Connection {
  private static instance: Knex | null = null

  private static buildConnectionOptions() {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL is not set')
    }

    const url = new URL(process.env.DATABASE_URL)
    return {
      host: url.hostname,
      port: parseInt(url.port || '5432', 10),
      user: decodeURIComponent(url.username),
      password: decodeURIComponent(url.password),
      database: url.pathname.slice(1) // strip leading /
    }
  }

  private static build(): Knex {
    const knexConnection = knex({
      client: 'postgres',
      debug: process.env.LOG_LEVEL === 'TRACE',
      connection: this.buildConnectionOptions(),
      pool: { min: 2, max: 10 },
      ...knexSnakeCaseMappers()
    })

    return knexConnection
  }

  /** Lazily-initialised Knex instance */
  static getConnection(): Knex {
    if (!this.instance) {
      this.instance = this.build()
      new Promise((resolve) => {
        this.instance!.raw('SELECT 1')
          .then((result) => {
            resolve(result)
          })
          .catch((err) => {
            throw new ConnectionError({
              message: 'Database connection failed',
              cause: err
            })
          })
      })
    }

    return this.instance
  }

  /** Graceful shutdown (tests, CLI scripts, etc.) */
  static async destroy(): Promise<void> {
    if (this.instance) await this.instance.destroy()

    this.instance = null
  }
}

export default Connection
