import { AsyncLocalStorage } from 'node:async_hooks'
import type { IDomainEventHolder, UniqueId, UnixTimestamp } from '@hatsuportal/shared-kernel'
import type { ITransactionContext, ITransactionScope, RollbackCallback } from '@hatsuportal/platform'

export class NodeAsyncLocalTransactionContext implements ITransactionContext {
  private readonly storage = new AsyncLocalStorage<ITransactionScope>()

  public getScope(): ITransactionScope | undefined {
    return this.storage.getStore()
  }

  public async run<T>(scope: ITransactionScope, work: () => Promise<T>): Promise<T> {
    return await this.storage.run(scope, work)
  }

  public requireActiveScope(): ITransactionScope {
    const scope = this.getScope()
    if (!scope || scope.state !== 'active') {
      throw new Error('An active transaction scope is required for this operation.')
    }
    return scope
  }

  public registerAfterRollback(callback: RollbackCallback): void {
    this.requireActiveScope().rollbackCallbacks.push(callback)
  }

  public addEventHolders(holders: Array<IDomainEventHolder<UniqueId, UnixTimestamp> | null>): void {
    const scope = this.requireActiveScope()
    holders.forEach((holder) => {
      if (holder) scope.eventHolders.add(holder)
    })
  }

  public markRollbackOnly(error: unknown): void {
    const scope = this.requireActiveScope()
    scope.rollbackOnly = true
    scope.rollbackError ??= error
  }

  public getExpectedUpdatedAt(key: string): UnixTimestamp | undefined {
    return this.requireActiveScope().expectedUpdatedAtByKey.get(key)
  }

  public setExpectedUpdatedAt(key: string, timestamp: UnixTimestamp): void {
    this.requireActiveScope().expectedUpdatedAtByKey.set(key, timestamp)
  }
}
