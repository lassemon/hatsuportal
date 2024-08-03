import type { IDataAccessProvider } from '../dataAccess/IDataAccessProvider'
import type { ITransactionContext } from '../dataAccess/ITransactionContext'
import type { IRepositoryHelpers } from './IRepositoryHelpers'
import type { UnixTimestamp } from '@hatsuportal/shared-kernel'
import type { IQueryBuilder } from '../dataAccess/IQueryBuilder'

/**
 * Abstract base class for repositories.
 * Provides common functionality for transaction management and database access.
 * Repositories in bounded contexts extend this class to remain database-agnostic.
 */
export abstract class RepositoryBase {
  protected constructor(
    private readonly defaultProvider: IDataAccessProvider,
    protected readonly helpers: IRepositoryHelpers,
    protected readonly transactionContext: ITransactionContext,
    protected readonly tableName: string
  ) {}

  /**
   * Returns the database accessor to use for queries.
   * If inside a transaction, returns the transaction (which implements IDataAccessProvider).
   * Otherwise, returns the default provider (connection pool).
   */
  protected database(): IDataAccessProvider {
    const scope = this.transactionContext.getScope()
    if (!scope) return this.defaultProvider
    if (scope.state !== 'active') {
      throw new Error('Cannot access a repository through a completed transaction scope.')
    }
    return scope.transaction
  }

  protected table<TRecord extends {} = never>(): IQueryBuilder<TRecord> {
    return this.database().table<TRecord>(this.tableName)
  }

  protected recordKey(recordId: string): string {
    return `${this.tableName}:${recordId}`
  }

  protected registerExpectedUpdatedAt(recordId: string, timestamp: UnixTimestamp): void {
    this.transactionContext.setExpectedUpdatedAt(this.recordKey(recordId), timestamp)
  }

  protected requireExpectedUpdatedAt(recordId: string): UnixTimestamp {
    const expectedUpdatedAt = this.transactionContext.getExpectedUpdatedAt(this.recordKey(recordId))
    if (!expectedUpdatedAt) {
      throw new Error(`Repository did not load '${recordId}' for an optimistic write.`)
    }
    return expectedUpdatedAt
  }

  getTableName(): string {
    return this.tableName
  }
}
