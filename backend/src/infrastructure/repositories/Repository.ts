import { IRepository } from '@hatsuportal/domain'
import { Knex } from 'knex'
import connection from '../dataAccess/database/connection'

export class Repository implements IRepository {
  protected transaction: Knex.Transaction | null = null

  setTransaction(transaction: Knex.Transaction | null): void {
    this.transaction = transaction
  }

  protected getConnection(): Knex.Transaction | Knex {
    return this.transaction ? this.transaction : connection
  }
}
