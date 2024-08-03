import { describe, expect, it, vi } from 'vitest'
import { UnixTimestamp } from '@hatsuportal/shared-kernel'
import type { IDataAccessProvider } from '../../application/dataAccess/IDataAccessProvider'
import type { IRepositoryHelpers } from '../../application/repositories/IRepositoryHelpers'
import type { ITransactionContext, ITransactionScope } from '../../application/dataAccess/ITransactionContext'
import { RepositoryBase } from './RepositoryBase'

class ScopeCoupledTransactionContext implements ITransactionContext {
  private activeScope: ITransactionScope | undefined

  getScope(): ITransactionScope | undefined {
    return this.activeScope
  }

  async run<T>(scope: ITransactionScope, work: () => Promise<T>): Promise<T> {
    const previous = this.activeScope
    this.activeScope = scope
    try {
      return await work()
    } finally {
      this.activeScope = previous
    }
  }

  requireActiveScope(): ITransactionScope {
    const scope = this.getScope()
    if (!scope || scope.state !== 'active') {
      throw new Error('An active transaction scope is required for this operation.')
    }
    return scope
  }

  registerAfterRollback(): void {
    this.requireActiveScope()
  }

  addEventHolders(): void {
    this.requireActiveScope()
  }

  markRollbackOnly(): void {
    this.requireActiveScope()
  }

  getExpectedUpdatedAt(key: string): UnixTimestamp | undefined {
    return this.requireActiveScope().expectedUpdatedAtByKey.get(key)
  }

  setExpectedUpdatedAt(key: string, timestamp: UnixTimestamp): void {
    this.requireActiveScope().expectedUpdatedAtByKey.set(key, timestamp)
  }
}

class TestRepository extends RepositoryBase {
  constructor(
    defaultProvider: IDataAccessProvider,
    helpers: IRepositoryHelpers,
    transactionContext: ITransactionContext
  ) {
    super(defaultProvider, helpers, transactionContext, 'stories')
  }

  public resolveDatabase(): IDataAccessProvider {
    return this.database()
  }

  public registerUpdatedAt(recordId: string, timestamp: UnixTimestamp): void {
    this.registerExpectedUpdatedAt(recordId, timestamp)
  }

  public requireUpdatedAt(recordId: string): UnixTimestamp {
    return this.requireExpectedUpdatedAt(recordId)
  }
}

function createScope(state: ITransactionScope['state'] = 'active'): ITransactionScope {
  return {
    transaction: { table: vi.fn() } as never,
    eventHolders: new Set(),
    rollbackCallbacks: [],
    expectedUpdatedAtByKey: new Map(),
    state,
    rollbackOnly: false,
    rollbackError: null
  }
}

describe('RepositoryBase', () => {
  const defaultProvider = { table: vi.fn() } as unknown as IDataAccessProvider
  const helpers = {} as IRepositoryHelpers

  it('returns the default provider when no transaction scope is active', () => {
    const context = new ScopeCoupledTransactionContext()
    const repository = new TestRepository(defaultProvider, helpers, context)

    expect(repository.resolveDatabase()).toBe(defaultProvider)
  })

  it('returns the active scope transaction when a scope is active', async () => {
    const context = new ScopeCoupledTransactionContext()
    const repository = new TestRepository(defaultProvider, helpers, context)
    const scope = createScope()

    await context.run(scope, async () => {
      expect(repository.resolveDatabase()).toBe(scope.transaction)
    })
  })

  it('throws when accessing database through a completed scope', async () => {
    const context = new ScopeCoupledTransactionContext()
    const repository = new TestRepository(defaultProvider, helpers, context)
    const scope = createScope('completed')

    await context.run(scope, async () => {
      expect(() => repository.resolveDatabase()).toThrow('Cannot access a repository through a completed transaction scope.')
    })
  })

  it('throws when requiring expected updated-at without an active scope', () => {
    const context = new ScopeCoupledTransactionContext()
    const repository = new TestRepository(defaultProvider, helpers, context)

    expect(() => repository.requireUpdatedAt('story-1')).toThrow('An active transaction scope is required for this operation.')
  })

  it('throws when expected updated-at was never registered in the active scope', async () => {
    const context = new ScopeCoupledTransactionContext()
    const repository = new TestRepository(defaultProvider, helpers, context)
    const scope = createScope()

    await context.run(scope, async () => {
      expect(() => repository.requireUpdatedAt('story-1')).toThrow("Repository did not load 'story-1' for an optimistic write.")
    })
  })

  it('returns the registered expected updated-at timestamp', async () => {
    const context = new ScopeCoupledTransactionContext()
    const repository = new TestRepository(defaultProvider, helpers, context)
    const scope = createScope()
    const timestamp = new UnixTimestamp(42)

    await context.run(scope, async () => {
      repository.registerUpdatedAt('story-1', timestamp)
      expect(repository.requireUpdatedAt('story-1')).toBe(timestamp)
    })
  })
})
