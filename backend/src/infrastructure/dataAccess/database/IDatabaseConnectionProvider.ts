import { Knex } from 'knex'
import Connection from './connection'
import { IDatabaseConnectionProvider } from '@hatsuportal/foundation'

export class ConnectionProvider implements IDatabaseConnectionProvider<Knex> {
  async getConnection(): Promise<Knex> {
    return Connection.getConnection() // reuse your singleton internally
  }
}
