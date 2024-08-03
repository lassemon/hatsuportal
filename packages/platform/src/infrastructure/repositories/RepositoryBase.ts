import { ITransactionAware } from '../dataAccess/ITransactionAware'
import { ITransaction } from '../dataAccess/ITransaction'
import { IDataAccessProvider } from '../dataAccess/IDataAccessProvider'
import { IRepositoryHelpers } from './IRepositoryHelpers'
import { UnixTimestamp } from '@hatsuportal/shared-kernel'
import { IQueryBuilder } from '../dataAccess/IQueryBuilder'

/**
 * Abstract base class for repositories.
 * Provides common functionality for transaction management and database access.
 * Repositories in bounded contexts extend this class to remain database-agnostic.
 */
export abstract class RepositoryBase implements ITransactionAware {
  protected transaction: ITransaction | null = null
  protected lastLoadedMap: Map<string, UnixTimestamp> = new Map()

  protected constructor(
    private readonly defaultProvider: IDataAccessProvider,
    protected readonly helpers: IRepositoryHelpers,
    protected readonly tableName: string
  ) {}

  setTransaction(transaction: ITransaction | null): void {
    this.transaction = transaction
  }

  /**
   * Returns the database accessor to use for queries.
   * If inside a transaction, returns the transaction (which implements IDataAccessProvider).
   * Otherwise, returns the default provider (connection pool).
   */
  protected database(): IDataAccessProvider {
    // ITransaction extends IDataAccessProvider, so we can use it directly
    return this.transaction || this.defaultProvider
  }

  protected table<TRecord extends {} = any>(): IQueryBuilder<TRecord> {
    return this.database().table<TRecord>(this.tableName)
  }

  clearLastLoadedMap(): void {
    this.lastLoadedMap.clear()
  }

  getTableName(): string {
    return this.tableName
  }
}
