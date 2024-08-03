import { describe, expect, it } from 'vitest'
import { MapCache } from '@hatsuportal/platform'
import { Password, User, UserId, UserName } from '../../domain'
import { UserWriteRepositoryWithCache } from './UserWriteRepositoryWithCache'
import * as Fixture from '../../__test__/testFactory'

describe('UserWriteRepositoryWithCache', () => {
  const createMockRepository = () => {
    const baseRepo = Fixture.userWriteRepositoryMock()
    const cache = new MapCache<User>()
    const repository = new UserWriteRepositoryWithCache(baseRepo, cache)
    return { baseRepo, cache, repository }
  }

  it('delegates findByIdForUpdate without caching', async () => {
    const { baseRepo, cache, repository } = createMockRepository()
    const user = Fixture.userMock()
    baseRepo.findByIdForUpdate.mockResolvedValue(user)

    await expect(repository.findByIdForUpdate(user.id)).resolves.toBe(user)
    await expect(repository.findByIdForUpdate(user.id)).resolves.toBe(user)
    expect(baseRepo.findByIdForUpdate).toHaveBeenCalledTimes(2)
    expect(cache.store.size).toBe(0)
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

  it('invalidates id and name keys on insert', async () => {
    const { baseRepo, cache, repository } = createMockRepository()
    const user = Fixture.userMock()
    cache.set(`findById:${user.id.value}`, user)
    cache.set(`findByName:${user.name.value}`, user)
    baseRepo.insert.mockResolvedValue(user)

    await repository.insert(user, Password.create('Password123!@#'))

    expect(cache.has(`findById:${user.id.value}`)).toBe(false)
    expect(cache.has(`findByName:${user.name.value}`)).toBe(false)
  })

  it('invalidates old findByName key after rename on update', async () => {
    const { baseRepo, cache, repository } = createMockRepository()
    const oldName = 'oldusername'
    const newName = 'newusername'
    const userBefore = Fixture.userMock({ name: new UserName(oldName) })
    const userAfter = Fixture.userMock({ name: new UserName(newName) })

    cache.set(`findById:${userBefore.id.value}`, userBefore)
    cache.set(`findByName:${oldName}`, userBefore)
    baseRepo.update.mockResolvedValue(userAfter)

    await repository.update(userAfter)

    expect(cache.has(`findById:${userAfter.id.value}`)).toBe(false)
    expect(cache.has(`findByName:${oldName}`)).toBe(false)
    expect(cache.has(`findByName:${newName}`)).toBe(false)
  })

  it('invalidates cache keys on deactivate', async () => {
    const { baseRepo, cache, repository } = createMockRepository()
    const user = Fixture.userMock()
    cache.set(`findById:${user.id.value}`, user)
    cache.set(`findByName:${user.name.value}`, user)
    baseRepo.deactivate.mockResolvedValue(user)

    await repository.deactivate(user)

    expect(cache.has(`findById:${user.id.value}`)).toBe(false)
    expect(cache.has(`findByName:${user.name.value}`)).toBe(false)
  })
})
