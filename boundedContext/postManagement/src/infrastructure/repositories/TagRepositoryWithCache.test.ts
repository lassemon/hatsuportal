import { describe, expect, it } from 'vitest'
import { Tag, TagId } from '../../domain'
import { MapCache } from '../../__test__/mapCache'
import { TagRepositoryWithCache } from './TagRepositoryWithCache'
import * as Fixture from '../../__test__/testFactory'

describe('TagRepositoryWithCache', () => {
  const setup = () => {
    const baseRepo = Fixture.tagRepositoryMock()
    const cache = new MapCache<Tag | Tag[]>()
    const repository = new TagRepositoryWithCache(baseRepo, cache)
    return { baseRepo, cache, repository }
  }

  it('loads findById from base on miss and serves cache on hit', async () => {
    const { baseRepo, repository } = setup()
    const tag = Fixture.tagMock()
    baseRepo.findById.mockResolvedValue(tag)

    await expect(repository.findById(new TagId(Fixture.sampleTagId))).resolves.toEqual(tag)
    await expect(repository.findById(new TagId(Fixture.sampleTagId))).resolves.toEqual(tag)
    expect(baseRepo.findById).toHaveBeenCalledTimes(1)
  })

  it('loads findAll from base on miss and serves cache on hit', async () => {
    const { baseRepo, repository } = setup()
    const tags = [Fixture.tagMock()]
    baseRepo.findAll.mockResolvedValue(tags)

    await expect(repository.findAll()).resolves.toEqual(tags)
    await expect(repository.findAll()).resolves.toEqual(tags)
    expect(baseRepo.findAll).toHaveBeenCalledTimes(1)
  })

  it('passes through findByIds without caching', async () => {
    const { baseRepo, cache, repository } = setup()
    const tags = [Fixture.tagMock()]
    baseRepo.findByIds.mockResolvedValue(tags)

    await expect(repository.findByIds([new TagId(Fixture.sampleTagId)])).resolves.toEqual(tags)
    await expect(repository.findByIds([new TagId(Fixture.sampleTagId)])).resolves.toEqual(tags)
    expect(baseRepo.findByIds).toHaveBeenCalledTimes(2)
    expect(cache.store.size).toBe(0)
  })

  it('invalidates findAll on insert', async () => {
    const { baseRepo, cache, repository } = setup()
    const tag = Fixture.tagMock()
    cache.set('findAll', [tag])

    await repository.insert(tag)

    expect(cache.has('findAll')).toBe(false)
    expect(baseRepo.insert).toHaveBeenCalledWith(tag)
  })

  it('invalidates findAll on insertMany', async () => {
    const { baseRepo, cache, repository } = setup()
    const tags = [Fixture.tagMock()]
    cache.set('findAll', tags)

    await repository.insertMany(tags)

    expect(cache.has('findAll')).toBe(false)
    expect(baseRepo.insertMany).toHaveBeenCalledWith(tags)
  })

  it('invalidates findById and findAll on update', async () => {
    const { baseRepo, cache, repository } = setup()
    const tag = Fixture.tagMock()
    cache.set(`findById:${Fixture.sampleTagId}`, tag)
    cache.set('findAll', [tag])
    baseRepo.update.mockResolvedValue(tag)

    await repository.update(tag)

    expect(cache.has(`findById:${Fixture.sampleTagId}`)).toBe(false)
    expect(cache.has('findAll')).toBe(false)
  })

  it('invalidates findById and findAll on delete', async () => {
    const { baseRepo, cache, repository } = setup()
    const tag = Fixture.tagMock()
    cache.set(`findById:${Fixture.sampleTagId}`, tag)
    cache.set('findAll', [tag])

    await repository.delete(tag)

    expect(cache.has(`findById:${Fixture.sampleTagId}`)).toBe(false)
    expect(cache.has('findAll')).toBe(false)
    expect(baseRepo.delete).toHaveBeenCalledWith(tag)
  })

  it('invalidates findById entries and findAll on deleteMany', async () => {
    const { baseRepo, cache, repository } = setup()
    const tag = Fixture.tagMock()
    const otherTagId = 'test2b19-tag-4792-a2f0-f95ccab82d93-a2f0-f95cc2met'
    cache.set(`findById:${Fixture.sampleTagId}`, tag)
    cache.set(`findById:${otherTagId}`, tag)
    cache.set('findAll', [tag])

    await repository.deleteMany([new TagId(Fixture.sampleTagId), new TagId(otherTagId)])

    expect(cache.has(`findById:${Fixture.sampleTagId}`)).toBe(false)
    expect(cache.has(`findById:${otherTagId}`)).toBe(false)
    expect(cache.has('findAll')).toBe(false)
    expect(baseRepo.deleteMany).toHaveBeenCalledTimes(1)
  })
})
