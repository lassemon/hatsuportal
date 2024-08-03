import { knex, Knex } from 'knex'
import { knexSnakeCaseMappers } from 'objection'
import { types as pgTypes } from 'pg'

pgTypes.setTypeParser(20, (val: string) => parseInt(val, 10))

let instance: Knex | null = null

function buildConnectionOptions(databaseUrl: string) {
  const url = new URL(databaseUrl)
  return {
    host: url.hostname,
    port: parseInt(url.port || '5432', 10),
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname.slice(1)
  }
}

export class TestConnection {
  static connect(databaseUrl: string): Knex {
    if (!instance) {
      instance = knex({
        client: 'postgres',
        connection: buildConnectionOptions(databaseUrl),
        pool: { min: 1, max: 5 },
        ...knexSnakeCaseMappers()
      })
    }
    return instance
  }

  static async destroy(): Promise<void> {
    if (instance) {
      await instance.destroy()
      instance = null
    }
  }
}
