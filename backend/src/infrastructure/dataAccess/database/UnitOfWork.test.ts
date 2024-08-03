import { describe, expect, it, vi } from 'vitest'
import { UnixTimestamp, type IDomainEventHolder, type UniqueId } from '@hatsuportal/shared-kernel'
import { NodeAsyncLocalTransactionContext } from './NodeAsyncLocalTransactionContext'
import { UnitOfWork } from './UnitOfWork'

describe('UnitOfWork', () => {
  it('deduplicates event holders returned from nested and parent callbacks', async () => {
    const transactionContext = new NodeAsyncLocalTransactionContext()
    const holder = {
      id: { value: 'holder-1' } as UniqueId,
      domainEvents: [],
      addDomainEvent: vi.fn(),
      clearEvents: vi.fn()
    } satisfies IDomainEventHolder<UniqueId, UnixTimestamp>

    const domainEventService = {
      persistToOutbox: vi.fn()
    }

    const unitOfWork = new UnitOfWork(domainEventService as never, {
      getConnection: () => ({
        transaction: async (work: (trx: unknown) => Promise<unknown>) => work({})
      })
    } as never, transactionContext)

    await unitOfWork.execute(async () => {
      await unitOfWork.execute(async () => [holder])
      return [holder]
    })

    expect(domainEventService.persistToOutbox).toHaveBeenCalledWith([holder])
    expect(holder.clearEvents).toHaveBeenCalledTimes(1)
  })

  it('marks nested failures rollback-only for the root transaction', async () => {
    const transactionContext = new NodeAsyncLocalTransactionContext()
    let capturedScopeRollbackOnly = false

    const unitOfWork = new UnitOfWork({ persistToOutbox: vi.fn() } as never, {
      getConnection: () => ({
        transaction: async (work: (trx: unknown) => Promise<unknown>) => {
          return work({})
        }
      })
    } as never, transactionContext)

    const originalRun = transactionContext.run.bind(transactionContext)
    vi.spyOn(transactionContext, 'run').mockImplementation(async (scope, work) => {
      try {
        return await originalRun(scope, work)
      } finally {
        capturedScopeRollbackOnly = scope.rollbackOnly
      }
    })

    await expect(
      unitOfWork.execute(async () => {
        await unitOfWork.execute(async () => {
          throw new Error('nested failure')
        })
        return []
      })
    ).rejects.toThrow('Transaction failed')

    expect(capturedScopeRollbackOnly).toBe(true)
  })

  it('stores optimistic-lock baselines in separate parallel root scopes', async () => {
    const transactionContext = new NodeAsyncLocalTransactionContext()
    const baselines: Array<string | undefined> = []

    const unitOfWork = new UnitOfWork({ persistToOutbox: vi.fn() } as never, {
      getConnection: () => ({
        transaction: async (work: (trx: unknown) => Promise<unknown>) => work({})
      })
    } as never, transactionContext)

    await Promise.all([
      unitOfWork.execute(async () => {
        transactionContext.setExpectedUpdatedAt('stories:a', new UnixTimestamp(10))
        baselines.push(transactionContext.getExpectedUpdatedAt('stories:a')?.value.toString())
        return []
      }),
      unitOfWork.execute(async () => {
        transactionContext.setExpectedUpdatedAt('stories:b', new UnixTimestamp(20))
        baselines.push(transactionContext.getExpectedUpdatedAt('stories:b')?.value.toString())
        return []
      })
    ])

    expect(baselines).toEqual(['10', '20'])
  })

  it('requires an active scope before registering optimistic-lock baselines', () => {
    const transactionContext = new NodeAsyncLocalTransactionContext()

    expect(() => transactionContext.setExpectedUpdatedAt('stories:1', new UnixTimestamp(1))).toThrow(
      'An active transaction scope is required for this operation.'
    )
  })
})
