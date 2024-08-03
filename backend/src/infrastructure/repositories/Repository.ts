import { Knex } from 'knex'
import connection, { KnexTransaction } from '../dataAccess/database/connection'
import type { DatabaseError } from 'pg'
import { ConcurrencyError, DataPersistenceError, ITransaction, ITransactionAware } from '@hatsuportal/platform'
import { UnixTimestamp } from '@hatsuportal/shared-kernel'

/**
 * Narrow unknown errors thrown by Knex/pg to Postgres DatabaseError.
 * Knex forwards node-postgres errors which include a string `code`
 * like "23505" for unique-violation.
 */
export function isPostgresDatabaseError(error: unknown): error is DatabaseError {
  return (
    typeof error === 'object' &&
    error !== null &&
    // `code` is the key discriminator; present on pg DatabaseError
    'code' in error &&
    typeof (error as { code?: unknown }).code === 'string'
  )
}

export class Repository implements ITransactionAware {
  protected transaction: ITransaction | null = null
  protected lastLoadedMap: Map<string, UnixTimestamp> = new Map()

  protected constructor(protected readonly tableName: string) {}

  getTableName(): string {
    return this.tableName
  }

  setTransaction(transaction: ITransaction | null): void {
    this.transaction = transaction
  }

  /** Re-root Knex calls either inside the current transaction or the singleton pool */
  protected async getConnection(): Promise<Knex | Knex.Transaction> {
    if (this.transaction instanceof KnexTransaction) {
      return this.transaction.underlying
    }
    return connection.getConnection()
  }

  protected async databaseOrTransaction(): Promise<Knex | Knex.Transaction> {
    return await this.getConnection()
  }

  clearLastLoadedMap(): void {
    this.lastLoadedMap.clear()
  }

  throwDataPersistenceError = (error: unknown) => {
    if (error instanceof ConcurrencyError) {
      throw error
    }
    if (error instanceof Error) {
      throw new DataPersistenceError({ message: error.message || 'UnknownError', cause: error })
    } else {
      throw new DataPersistenceError({ message: 'UnknownError', cause: error })
    }
  }

  /** Convenience predicate for the unique-violation error (duplicate key). */
  isPostgresUniqueViolationError(error: unknown): error is DatabaseError {
    return isPostgresDatabaseError(error) && (error as DatabaseError).code === '23505'
  }

  /** Extract the violated constraint name if Postgres provided it. */
  getPostgresConstraintName(error: DatabaseError): string | undefined {
    return error.constraint
  }

  /**
   * Try to parse the conflicting column(s) and value(s) from Postgres's detail text.
   * Example detail: `Key (email)=(joe@example.com) already exists.`
   */
  tryParseUniqueViolationDetail(error: DatabaseError): { columns: string[]; values: string[] } | undefined {
    const detail = error.detail ?? ''
    const match = detail.match(/Key \((.+?)\)=\((.+?)\) already exists\./)
    if (!match) return undefined

    const columns = match[1].split(',').map((c) => c.trim())
    const values = match[2].split(',').map((v) => v.trim())
    return { columns, values }
  }
}
