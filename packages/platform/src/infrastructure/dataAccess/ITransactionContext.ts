import type { IDomainEventHolder, UniqueId, UnixTimestamp } from '@hatsuportal/shared-kernel'
import type { ITransaction } from './ITransaction'

export type RollbackCallback = () => Promise<void>

export interface ITransactionScope {
  readonly transaction: ITransaction
  readonly eventHolders: Set<IDomainEventHolder<UniqueId, UnixTimestamp>>
  readonly rollbackCallbacks: RollbackCallback[]
  readonly expectedUpdatedAtByKey: Map<string, UnixTimestamp>
  state: 'active' | 'completed'
  rollbackOnly: boolean
  rollbackError: unknown | null
}

export interface ITransactionContext {
  getScope(): ITransactionScope | undefined
  run<T>(scope: ITransactionScope, work: () => Promise<T>): Promise<T>
  requireActiveScope(): ITransactionScope
  /**
   * Runs after the DB transaction rolls back; used for compensating actions
   * (e.g. deleting uploaded files that were prepared outside the transaction).
   */
  registerAfterRollback(callback: RollbackCallback): void
  addEventHolders(holders: Array<IDomainEventHolder<UniqueId, UnixTimestamp> | null>): void
  /**
   * Flags the current scope so the root transaction must roll back, without starting a new one.
   * Used when nested `execute()` catches a failure: the inner call rethrows, but the outer
   * Knex transaction still needs an explicit signal to abort instead of committing.
   */
  markRollbackOnly(error: unknown): void
  getExpectedUpdatedAt(key: string): UnixTimestamp | undefined
  setExpectedUpdatedAt(key: string, timestamp: UnixTimestamp): void
}
