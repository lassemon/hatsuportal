import { beforeAll, describe, expect, it } from 'vitest'
import Connection from '../../../../../infrastructure/dataAccess/database/connection'
import { PostgresAdvisoryLock } from '../../../../../infrastructure/dataAccess/database/PostgresAdvisoryLock'

describe('PostgresAdvisoryLock (integration)', () => {
  const lockKey = 991001

  beforeAll(async () => {
    const releaseLock = new PostgresAdvisoryLock(Connection, lockKey)
    await releaseLock.release()
  })

  it('acquires, blocks duplicate acquire, and releases the lock', async () => {
    const firstLock = new PostgresAdvisoryLock(Connection, lockKey)
    const secondLock = new PostgresAdvisoryLock(Connection, lockKey)

    expect(await firstLock.tryAcquire()).toBe(true)
    expect(await secondLock.tryAcquire()).toBe(false)

    await firstLock.release()
    expect(await secondLock.tryAcquire()).toBe(true)

    await secondLock.release()
  })

  it('allows release without acquire as a no-op', async () => {
    const lock = new PostgresAdvisoryLock(Connection, lockKey + 1)

    await expect(lock.release()).resolves.toBeUndefined()
  })
})
