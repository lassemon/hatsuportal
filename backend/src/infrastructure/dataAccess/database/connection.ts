import { DataPersistenceError, ITransaction } from '@hatsuportal/application'
import { Knex, knex } from 'knex'

export interface IKnexConnection<TRecord extends {} = any, TResult = any[]> {
  getConnection(): Knex<TRecord, TResult>
  getTransaction(): Promise<ITransaction>
}

export class KnexTransaction<TRecord extends {} = any, TResult = any[]> implements ITransaction {
  private transaction: Knex.Transaction | null = null

  constructor(private readonly knex: Knex<TRecord, TResult>) {}

  async begin(): Promise<void> {
    this.transaction = await this.knex.transaction()
  }

  async commit(): Promise<void> {
    if (!this.transaction) {
      throw new DataPersistenceError('Cannot commit work. Transaction not started.')
    }
    await this.transaction.commit()
  }

  async rollback(): Promise<void> {
    if (!this.transaction) {
      throw new DataPersistenceError('Cannot rollback work. Transaction not started.')
    }
    await this.transaction.rollback()
  }
}

export class KnexConnection<TRecord extends {} = any, TResult = any[]> implements IKnexConnection<TRecord, TResult> {
  private static instance: KnexConnection | null = null
  private knexConnector: Knex<TRecord, TResult> | null = null

  constructor() {
    if (this.knexConnector === null) {
      this.knexConnector = knex<TRecord, TResult>({
        client: 'mysql',
        debug: process.env.LOG_LEVEL === 'DEBU',
        connection: {
          host: process.env.DATABASE_HOST || 'localhost',
          user: process.env.DATABASE_USER || 'development',
          password: process.env.DATABASE_PASSWORD || 'development123',
          database: process.env.DATABASE_SCHEMA || 'hatsuportal'
        }
      })
    }
  }

  private async init(): Promise<void> {
    if (!KnexConnection.instance && this.knexConnector) {
      try {
        await this.knexConnector?.raw('SELECT 1')
      } catch (error) {
        throw new DataPersistenceError('Database connection failed.')
      }
      KnexConnection.instance = this as unknown as KnexConnection
    }
  }

  public getConnection(): Knex<TRecord, TResult> {
    if (!this.knexConnector) {
      throw new DataPersistenceError('Database connection not initialized.')
    }
    this.init()
    return this.knexConnector
  }

  async getTransaction(): Promise<ITransaction> {
    if (!this.knexConnector) {
      throw new DataPersistenceError('Database connection not initialized.')
    }
    return new KnexTransaction(this.knexConnector)
  }
}

// Export a singleton instance
const knexConnection = new KnexConnection()
export default knexConnection
