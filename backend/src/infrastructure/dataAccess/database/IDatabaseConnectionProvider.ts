import { Knex } from 'knex'
import Connection from './connection'

export interface IDatabaseConnectionProvider {
  getConnection(): Promise<Knex>
}

export class ConnectionProvider implements IDatabaseConnectionProvider {
  async getConnection(): Promise<Knex> {
    return Connection.getConnection() // reuse your singleton internally
  }
}
