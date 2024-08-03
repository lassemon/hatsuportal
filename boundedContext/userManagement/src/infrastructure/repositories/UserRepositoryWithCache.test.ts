import { describe, expect, it } from 'vitest'
import { ICache } from '@hatsuportal/platform'
import { Password, User, UserId, UserName } from '../../domain'
import { UserRepositoryWithCache } from './UserRepositoryWithCache'
import * as Fixture from '../../__test__/testFactory'

class MapCache<T> implements ICache<T> {
  readonly store = new Map<string, T | null>()

  has(key: string): boolean {
    return this.store.has(key)
  }

  get(key: string): T | null | undefined {
    if (!this.store.has(key)) return undefined
    return this.store.get(key) as T | null
  }

  set(key: string, value: T | null): void {
    this.store.set(key, value)
  }

  delete(key: string): boolean {
    return this.store.delete(key)
  }

  invalidateByPrefix(prefix: string): number {
    let count = 0
    for (const key of [...this.store.keys()]) {
      if (key.startsWith(prefix)) {
        this.store.delete(key)
        count++
      }
    }
    return count
  }
}

describe('UserRepositoryWithCache', () => {
  const createMockRepository = () => {
    const baseRepo = Fixture.userRepositoryMock()
    const cache = new MapCache<User | User[]>()
    const repository = new UserRepositoryWithCache(baseRepo, cache)
    return { baseRepo, cache, repository }
  }

  it('loads getAll from base on miss and serves cache on hit', async () => {
    const { baseRepo, repository } = createMockRepository()
    const users = [Fixture.userMock()]
    baseRepo.getAll.mockResolvedValue(users)

    await expect(repository.getAll()).resolves.toEqual(users)
    await expect(repository.getAll()).resolves.toEqual(users)
    expect(baseRepo.getAll).toHaveBeenCalledTimes(1)
  })

  it('loads findById from base on miss and serves cache on hit', async () => {
    const { baseRepo, repository } = createMockRepository()
    const user = Fixture.userMock()
    baseRepo.findById.mockResolvedValue(user)

    await expect(repository.findById(user.id)).resolves.toBe(user)
    await expect(repository.findById(user.id)).resolves.toBe(user)
    expect(baseRepo.findById).toHaveBeenCalledTimes(1)
  })

  it('loads findByName from base on miss and serves cache on hit', async () => {
    const { baseRepo, repository } = createMockRepository()
    const user = Fixture.userMock()
    baseRepo.findByName.mockResolvedValue(user)

    await expect(repository.findByName(user.name)).resolves.toBe(user)
    await expect(repository.findByName(user.name)).resolves.toBe(user)
    expect(baseRepo.findByName).toHaveBeenCalledTimes(1)
  })

  it('negatively caches findById null misses', async () => {
    const { baseRepo, repository } = createMockRepository()
    const userId = new UserId(Fixture.sampleUserId)
    baseRepo.findById.mockResolvedValue(null)

    await expect(repository.findById(userId)).resolves.toBeNull()
    await expect(repository.findById(userId)).resolves.toBeNull()
    expect(baseRepo.findById).toHaveBeenCalledTimes(1)
  })

  it('negatively caches findByName null misses', async () => {
    const { baseRepo, repository } = createMockRepository()
    const userName = new UserName(Fixture.sampleUserName)
    baseRepo.findByName.mockResolvedValue(null)

    await expect(repository.findByName(userName)).resolves.toBeNull()
    await expect(repository.findByName(userName)).resolves.toBeNull()
    expect(baseRepo.findByName).toHaveBeenCalledTimes(1)
  })

  it('never caches credentials lookups', async () => {
    const { baseRepo, cache, repository } = createMockRepository()
    const userId = new UserId(Fixture.sampleUserId)
    const userName = new UserName(Fixture.sampleUserName)

    await repository.getUserCredentialsByUserId(userId)
    await repository.getUserCredentialsByUsername(userName)
    expect(baseRepo.getUserCredentialsByUserId).toHaveBeenCalledTimes(1)
    expect(baseRepo.getUserCredentialsByUsername).toHaveBeenCalledTimes(1)
    expect(cache.store.size).toBe(0)
  })

  it('delegates count without caching', async () => {
    const { baseRepo, cache, repository } = createMockRepository()
    baseRepo.count.mockResolvedValue(3)
    await expect(repository.count()).resolves.toBe(3)
    expect(cache.store.size).toBe(0)
  })

  it('invalidates id, name and getAll keys on insert', async () => {
    const { baseRepo, cache, repository } = createMockRepository()
    const user = Fixture.userMock()
    cache.set(`findById:${user.id.value}`, user)
    cache.set(`findByName:${user.name.value}`, user)
    cache.set('getAll', [user])
    baseRepo.insert.mockResolvedValue(user)

    await repository.insert(user, Password.create('Password123!@#'))

    expect(cache.has(`findById:${user.id.value}`)).toBe(false)
    expect(cache.has(`findByName:${user.name.value}`)).toBe(false)
    expect(cache.has('getAll')).toBe(false)
  })

  it('invalidates old findByName key after rename on update', async () => {
    const { baseRepo, cache, repository } = createMockRepository()
    const oldName = 'oldusername'
    const newName = 'newusername'
    const userBefore = Fixture.userMock({ name: new UserName(oldName) })
    const userAfter = Fixture.userMock({ name: new UserName(newName) })

    cache.set(`findById:${userBefore.id.value}`, userBefore)
    cache.set(`findByName:${oldName}`, userBefore)
    cache.set('getAll', [userBefore])
    baseRepo.update.mockResolvedValue(userAfter)

    await repository.update(userAfter)

    expect(cache.has(`findById:${userAfter.id.value}`)).toBe(false)
    expect(cache.has(`findByName:${oldName}`)).toBe(false)
    expect(cache.has(`findByName:${newName}`)).toBe(false)
    expect(cache.has('getAll')).toBe(false)
  })

  it('invalidates cache keys on deactivate', async () => {
    const { baseRepo, cache, repository } = createMockRepository()
    const user = Fixture.userMock()
    cache.set(`findById:${user.id.value}`, user)
    cache.set(`findByName:${user.name.value}`, user)
    cache.set('getAll', [user])
    baseRepo.deactivate.mockResolvedValue(user)

    await repository.deactivate(user)

    expect(cache.has(`findById:${user.id.value}`)).toBe(false)
    expect(cache.has(`findByName:${user.name.value}`)).toBe(false)
    expect(cache.has('getAll')).toBe(false)
  })

  it('returns empty array when getAll cache holds a non-array', async () => {
    const { baseRepo, cache, repository } = createMockRepository()
    cache.set('getAll', Fixture.userMock())
    await expect(repository.getAll()).resolves.toEqual([])
    expect(baseRepo.getAll).not.toHaveBeenCalled()
  })

  it('returns null when findById cache holds an array', async () => {
    const { baseRepo, cache, repository } = createMockRepository()
    const userId = new UserId(Fixture.sampleUserId)
    cache.set(`findById:${userId.value}`, [Fixture.userMock()])
    await expect(repository.findById(userId)).resolves.toBeNull()
    expect(baseRepo.findById).not.toHaveBeenCalled()
  })

  it('returns null when findByName cache holds an array', async () => {
    const { baseRepo, cache, repository } = createMockRepository()
    const userName = new UserName(Fixture.sampleUserName)
    cache.set(`findByName:${userName.value}`, [Fixture.userMock()])
    await expect(repository.findByName(userName)).resolves.toBeNull()
    expect(baseRepo.findByName).not.toHaveBeenCalled()
  })
})
