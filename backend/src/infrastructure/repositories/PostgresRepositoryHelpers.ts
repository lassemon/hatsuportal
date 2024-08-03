import type { DatabaseError } from 'pg'
import { IRepositoryHelpers, DataPersistenceError, ConcurrencyError } from '@hatsuportal/platform'

/**
 * PostgreSQL-specific implementation of IRepositoryHelpers.
 * Handles PostgreSQL database errors and provides helper methods for repositories.
 */
export class PostgresRepositoryHelpers implements IRepositoryHelpers {
  isUniqueViolationError(error: unknown): boolean {
    return this.isDatabaseError(error) && error.code === '23505'
  }

  getConstraintName(error: unknown): string | undefined {
    if (this.isDatabaseError(error)) {
      return error.constraint
    }
    return undefined
  }

  tryParseUniqueViolationDetail(error: unknown): { columns: string[]; values: string[] } | undefined {
    if (!this.isDatabaseError(error)) return undefined

    const detail = error.detail ?? ''
    const match = detail.match(/Key \((.+?)\)=\((.+?)\) already exists\./)
    if (!match) return undefined

    const columns = match[1].split(',').map((c) => c.trim())
    const values = match[2].split(',').map((v) => v.trim())
    return { columns, values }
  }

  throwDataPersistenceError(error: unknown): never {
    if (error instanceof ConcurrencyError) {
      throw error
    }
    if (error instanceof Error) {
      throw new DataPersistenceError({ message: error.message || 'UnknownError', cause: error })
    } else {
      throw new DataPersistenceError({ message: 'UnknownError', cause: error })
    }
  }

  private isDatabaseError(error: unknown): error is DatabaseError {
    return typeof error === 'object' && error !== null && 'code' in error && typeof (error as { code?: unknown }).code === 'string'
  }
}
