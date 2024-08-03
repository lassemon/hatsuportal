import { IAdvisoryLock, IDataConnectionProvider } from '@hatsuportal/platform'
import { Knex } from 'knex'

export class PostgresAdvisoryLock implements IAdvisoryLock {
  /*
   * We need to store the connection for us to be able to release it later.
   * If we release a lock with a different connection from the connection pool,
   * it will fail silently and the lock will not be released.
   */
  private heldConnection: unknown | null = null

  constructor(
    private readonly connectionProvider: IDataConnectionProvider<Knex>,
    private readonly lockKey: number
  ) {}

  async tryAcquire(): Promise<boolean> {
    const knex = this.connectionProvider.getConnection()
    const conn = await knex.client.acquireConnection()
    const result = await conn.query(`SELECT pg_try_advisory_lock(${this.lockKey}) AS acquired`)
    if (result.rows[0].acquired) {
      this.heldConnection = conn
      return true
    }
    knex.client.releaseConnection(conn)
    return false
  }

  async release(): Promise<void> {
    if (!this.heldConnection) return
    const knex = this.connectionProvider.getConnection()
    const conn = this.heldConnection as { query(sql: string): Promise<unknown> }
    await conn.query(`SELECT pg_advisory_unlock(${this.lockKey})`)
    knex.client.releaseConnection(this.heldConnection)
    this.heldConnection = null
  }
}
