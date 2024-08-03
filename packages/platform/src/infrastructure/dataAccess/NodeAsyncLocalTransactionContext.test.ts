import { describe, expect, it, vi } from 'vitest'
import { UnixTimestamp } from '@hatsuportal/shared-kernel'
import { NodeAsyncLocalTransactionContext } from './NodeAsyncLocalTransactionContext'
import type { ITransactionScope } from '../../application/dataAccess/ITransactionContext'

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

describe('NodeAsyncLocalTransactionContext', () => {
  it('isolates scopes across parallel run calls', async () => {
    const context = new NodeAsyncLocalTransactionContext()
    const baselines: Array<string | undefined> = []

    await Promise.all([
      context.run(createScope(), async () => {
        context.setExpectedUpdatedAt('stories:a', new UnixTimestamp(10))
        baselines.push(context.getExpectedUpdatedAt('stories:a')?.value.toString())
      }),
      context.run(createScope(), async () => {
        context.setExpectedUpdatedAt('stories:b', new UnixTimestamp(20))
        baselines.push(context.getExpectedUpdatedAt('stories:b')?.value.toString())
      })
    ])

    expect(baselines).toEqual(['10', '20'])
  })

  it('requires an active scope before reading or writing expected updated-at', () => {
    const context = new NodeAsyncLocalTransactionContext()

    expect(() => context.setExpectedUpdatedAt('stories:1', new UnixTimestamp(1))).toThrow(
      'An active transaction scope is required for this operation.'
    )
    expect(() => context.getExpectedUpdatedAt('stories:1')).toThrow(
      'An active transaction scope is required for this operation.'
    )
  })

  it('accumulates rollback callbacks on the active scope', async () => {
    const context = new NodeAsyncLocalTransactionContext()
    const scope = createScope()
    const callback = vi.fn().mockResolvedValue(undefined)

    await context.run(scope, async () => {
      context.registerAfterRollback(callback)
    })

    expect(scope.rollbackCallbacks).toEqual([callback])
  })

  it('marks the active scope rollback-only with the first error', async () => {
    const context = new NodeAsyncLocalTransactionContext()
    const scope = createScope()
    const firstError = new Error('first')
    const secondError = new Error('second')

    await context.run(scope, async () => {
      context.markRollbackOnly(firstError)
      context.markRollbackOnly(secondError)
    })

    expect(scope.rollbackOnly).toBe(true)
    expect(scope.rollbackError).toBe(firstError)
  })
})
