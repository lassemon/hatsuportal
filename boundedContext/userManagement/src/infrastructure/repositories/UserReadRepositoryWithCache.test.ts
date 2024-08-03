import { describe, expect, it } from 'vitest'
import { UserId } from '../../domain'
import { UserReadModelDTO } from '../../application'
import { UserReadRepositoryWithCache } from './UserReadRepositoryWithCache'
import * as Fixture from '../../__test__/testFactory'
import { MapCache } from '@hatsuportal/platform'

describe('UserReadRepositoryWithCache', () => {
  const setup = () => {
    const baseRepo = Fixture.userReadRepositoryMock()
    const cache = new MapCache<UserReadModelDTO>()
    const repository = new UserReadRepositoryWithCache(baseRepo, cache)
    return { baseRepo, cache, repository }
  }

  it('loads findById from base on miss and serves cache on hit', async () => {
    const { baseRepo, repository } = setup()
    const user = Fixture.userReadModelDTOMock()
    baseRepo.findById.mockResolvedValue(user)

    await expect(repository.findById(new UserId(Fixture.sampleUserId))).resolves.toEqual(user)
    await expect(repository.findById(new UserId(Fixture.sampleUserId))).resolves.toEqual(user)
    expect(baseRepo.findById).toHaveBeenCalledTimes(1)
  })

  it('negatively caches findById null misses', async () => {
    const { baseRepo, repository } = setup()
    baseRepo.findById.mockResolvedValue(null)

    await expect(repository.findById(new UserId(Fixture.sampleUserId))).resolves.toBeNull()
    await expect(repository.findById(new UserId(Fixture.sampleUserId))).resolves.toBeNull()
    expect(baseRepo.findById).toHaveBeenCalledTimes(1)
  })

  it('passes through findAll without caching', async () => {
    const { baseRepo, cache, repository } = setup()
    const users = [Fixture.userReadModelDTOMock()]
    baseRepo.findAll.mockResolvedValue(users)

    await expect(repository.findAll()).resolves.toEqual(users)
    await expect(repository.findAll()).resolves.toEqual(users)
    expect(baseRepo.findAll).toHaveBeenCalledTimes(2)
    expect(cache.store.size).toBe(0)
  })

  it('passes through findByName without caching', async () => {
    const { baseRepo, cache, repository } = setup()
    const user = Fixture.userReadModelDTOMock()
    baseRepo.findByName.mockResolvedValue(user)

    await expect(repository.findByName(Fixture.userMock().name)).resolves.toEqual(user)
    await expect(repository.findByName(Fixture.userMock().name)).resolves.toEqual(user)
    expect(baseRepo.findByName).toHaveBeenCalledTimes(2)
    expect(cache.store.size).toBe(0)
  })

  it('invalidateById drops cached findById entry', async () => {
    const { baseRepo, repository } = setup()
    const user = Fixture.userReadModelDTOMock()
    baseRepo.findById.mockResolvedValue(user)

    await repository.findById(new UserId(Fixture.sampleUserId))
    expect(baseRepo.findById).toHaveBeenCalledTimes(1)

    repository.invalidateById(new UserId(Fixture.sampleUserId))

    await repository.findById(new UserId(Fixture.sampleUserId))
    expect(baseRepo.findById).toHaveBeenCalledTimes(2)
  })
})
