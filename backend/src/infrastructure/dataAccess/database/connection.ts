import { Knex, knex } from 'knex'
import InfrastructureError from '../../errors/InfrastructureError'
import { knexSnakeCaseMappers } from 'objection'
import { types as pgTypes } from 'pg'
import { IDatabaseConnectionProvider, ITransaction } from '@hatsuportal/platform'

pgTypes.setTypeParser(20, (val: string) => parseInt(val, 10))

export class ConnectionProvider implements IDatabaseConnectionProvider<Knex> {
  async getConnection(): Promise<Knex> {
    return Connection.getConnection() // reuse singleton internally
  }
}
export class KnexTransaction implements ITransaction {
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

  get underlying(): Knex.Transaction {
    return this.knexTransaction
  }
}

class Connection {
  private static instance: Knex | null = null

  private static build(): Knex {
    const knexConnection = knex({
      client: 'postgres',
      debug: process.env.LOG_LEVEL === 'TRACE',
      connection: {
        host: process.env.DATABASE_HOST || 'localhost',
        user: process.env.DATABASE_USER || 'development',
        password: process.env.DATABASE_PASSWORD || 'development123',
        database: process.env.DATABASE_SCHEMA || 'hatsuportal'
      },
      pool: { min: 2, max: 10 },
      ...knexSnakeCaseMappers()
    })

    return knexConnection
  }

  /** Lazily-initialised Knex instance */
  static async getConnection(): Promise<Knex> {
    if (!this.instance) {
      this.instance = this.build()

      try {
        // test connetion
        await this.instance.raw('SELECT 1')
      } catch (err) {
        throw new InfrastructureError({
          message: 'Database connection failed',
          cause: err
        })
      }
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
