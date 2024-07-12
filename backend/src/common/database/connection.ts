import { Knex, knex } from 'knex'

export class Connection {
  private knexConnector: Knex | null = null

  constructor() {
    if (this.knexConnector === null) {
      this.knexConnector = knex({
        client: 'mysql',
        debug: process.env.LOG_LEVEL === 'DEBUG',
        connection: {
          host: process.env.DATABASE_HOST || 'localhost',
          user: process.env.DATABASE_USER || 'development',
          password: process.env.DATABASE_PASSWORD || 'development123',
          database: process.env.DATABASE_SCHEMA || 'hatsuportal'
        }
      })
    }
  }

  public getKnex(): Knex {
    return this.knexConnector as Knex
  }
}

export default new Connection().getKnex()
