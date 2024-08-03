import { Knex } from 'knex'
import Connection from './connection'

export interface IDatabaseConnectionProvider<T> {
  getConnection(): Promise<T>
}

export class ConnectionProvider implements IDatabaseConnectionProvider<Knex> {
  async getConnection(): Promise<Knex> {
    return Connection.getConnection() // reuse your singleton internally
  }
}
