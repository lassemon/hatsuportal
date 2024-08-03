import { IUnitOfWork } from './IUnitOfWork'

/**
 * A simple container that implements the unit of work pattern. When acquired, signifies that
 * one has uncontested access to a given entity, and once finished signifies that all work on
 * said entity is finished and access can be granted to other interested parties.
 */
export interface ITransactionalUnitOfWork<T> extends IUnitOfWork<T> {
  /**
   * Begins a transaction for the unit of work.
   */
  beginTransaction(): Promise<void>

  /**
   * Commits the transaction for the unit of work.
   */
  commit(): void

  /**
   * Rolls back the transaction for the unit of work.
   */
  rollback(): void
}
