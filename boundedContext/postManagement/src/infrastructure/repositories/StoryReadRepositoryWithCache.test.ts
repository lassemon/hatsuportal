import { describe, expect, it } from 'vitest'
import { OrderEnum, SortableKeyEnum } from '@hatsuportal/common'
import { PostId } from '../../domain'
import { StoryReadModelDTO, StorySearchCriteriaDTO } from '../../application'
import { MapCache } from '../../__test__/mapCache'
import { StoryReadRepositoryWithCache } from './StoryReadRepositoryWithCache'
import * as Fixture from '../../__test__/testFactory'

describe('StoryReadRepositoryWithCache', () => {
  const searchCriteria = (): StorySearchCriteriaDTO => ({
    order: OrderEnum.Ascending,
    orderBy: SortableKeyEnum.VISIBILITY,
    storiesPerPage: 50,
    pageNumber: 1
  })

  const setup = () => {
    const baseRepo = Fixture.storyReadRepositoryMock()
    const cache = new MapCache<StoryReadModelDTO>()
    const repository = new StoryReadRepositoryWithCache(baseRepo, cache)
    return { baseRepo, cache, repository }
  }

  it('loads findById from base on miss and serves cache on hit', async () => {
    const { baseRepo, repository } = setup()
    const story = Fixture.storyReadModelDTOMock()
    baseRepo.findById.mockResolvedValue(story)

    await expect(repository.findById(new PostId(Fixture.sampleStoryId))).resolves.toEqual(story)
    await expect(repository.findById(new PostId(Fixture.sampleStoryId))).resolves.toEqual(story)
    expect(baseRepo.findById).toHaveBeenCalledTimes(1)
  })

  it('negatively caches findById null misses', async () => {
    const { baseRepo, repository } = setup()
    baseRepo.findById.mockResolvedValue(null)

    await expect(repository.findById(new PostId(Fixture.sampleStoryId))).resolves.toBeNull()
    await expect(repository.findById(new PostId(Fixture.sampleStoryId))).resolves.toBeNull()
    expect(baseRepo.findById).toHaveBeenCalledTimes(1)
  })

  it('passes through search without caching', async () => {
    const { baseRepo, cache, repository } = setup()
    const stories = [Fixture.storyReadModelDTOMock()]
    baseRepo.search.mockResolvedValue(stories)

    await expect(repository.search(searchCriteria())).resolves.toEqual(stories)
    await expect(repository.search(searchCriteria())).resolves.toEqual(stories)
    expect(baseRepo.search).toHaveBeenCalledTimes(2)
    expect(cache.store.size).toBe(0)
  })

  it('passes through findAll without caching', async () => {
    const { baseRepo, cache, repository } = setup()
    const stories = [Fixture.storyReadModelDTOMock()]
    baseRepo.findAll.mockResolvedValue(stories)

    await expect(repository.findAll(SortableKeyEnum.VISIBILITY, OrderEnum.Ascending)).resolves.toEqual(stories)
    await expect(repository.findAll(SortableKeyEnum.VISIBILITY, OrderEnum.Ascending)).resolves.toEqual(stories)
    expect(baseRepo.findAll).toHaveBeenCalledTimes(2)
    expect(cache.store.size).toBe(0)
  })

  it('passes through findByIds without caching', async () => {
    const { baseRepo, cache, repository } = setup()
    const stories = [Fixture.storyReadModelDTOMock()]
    baseRepo.findByIds.mockResolvedValue(stories)

    await expect(repository.findByIds([new PostId(Fixture.sampleStoryId)])).resolves.toEqual(stories)
    await expect(repository.findByIds([new PostId(Fixture.sampleStoryId)])).resolves.toEqual(stories)
    expect(baseRepo.findByIds).toHaveBeenCalledTimes(2)
    expect(cache.store.size).toBe(0)
  })

  it('invalidateById drops cached findById entry', async () => {
    const { baseRepo, repository } = setup()
    const story = Fixture.storyReadModelDTOMock()
    baseRepo.findById.mockResolvedValue(story)

    await repository.findById(new PostId(Fixture.sampleStoryId))
    expect(baseRepo.findById).toHaveBeenCalledTimes(1)

    repository.invalidateById(new PostId(Fixture.sampleStoryId))

    await repository.findById(new PostId(Fixture.sampleStoryId))
    expect(baseRepo.findById).toHaveBeenCalledTimes(2)
  })
})
