import { describe, expect, it, vi } from 'vitest'
import { PostQueryFacade } from './PostQueryFacade'
import { PostQueryMapper } from './mappers/PostQueryMapper'
import * as Fixture from '../../../__test__/testFactory'
import { ImageStateEnum } from '@hatsuportal/common'

describe('PostQueryFacade', () => {
  const storyWithRelations = () => ({
    ...Fixture.storyReadModelDTOMock(),
    createdByName: 'Test User',
    coverImage: null,
    imageLoadState: ImageStateEnum.NotSet,
    imageLoadError: null,
    tags: [],
    commentListChunk: { comments: [], nextCursor: null }
  })

  it('returns story contracts for creator', async () => {
    const storyLookupService = Fixture.storyLookupServiceMock()
    storyLookupService.findAllForCreator.mockResolvedValue([storyWithRelations()])
    const facade = new PostQueryFacade(storyLookupService, new PostQueryMapper())

    const result = await facade.getStoriesByCreatorId(Fixture.sampleUserId)

    expect(storyLookupService.findAllForCreator).toHaveBeenCalledTimes(1)
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe(Fixture.sampleStoryId)
  })

  it('returns empty array when creator has no stories', async () => {
    const storyLookupService = Fixture.storyLookupServiceMock()
    storyLookupService.findAllForCreator.mockResolvedValue([])
    const facade = new PostQueryFacade(storyLookupService, new PostQueryMapper())

    await expect(facade.getStoriesByCreatorId(Fixture.sampleUserId)).resolves.toEqual([])
  })

  it('propagates lookup service failures', async () => {
    const storyLookupService = Fixture.storyLookupServiceMock()
    storyLookupService.findAllForCreator.mockRejectedValue(new Error('lookup failed'))
    const facade = new PostQueryFacade(storyLookupService, new PostQueryMapper())

    await expect(facade.getStoriesByCreatorId(Fixture.sampleUserId)).rejects.toThrow('lookup failed')
  })

  it('maps multiple stories through PostQueryMapper', async () => {
    const storyLookupService = Fixture.storyLookupServiceMock()
    storyLookupService.findAllForCreator.mockResolvedValue([
      storyWithRelations(),
      { ...storyWithRelations(), id: 'other-story-a2f0-f95ccab82d92', title: 'Other Story' }
    ])
    const mapper = new PostQueryMapper()
    const toStoryContract = vi.spyOn(mapper, 'toStoryContract')
    const facade = new PostQueryFacade(storyLookupService, mapper)

    const result = await facade.getStoriesByCreatorId(Fixture.sampleUserId)

    expect(result).toHaveLength(2)
    expect(toStoryContract).toHaveBeenCalledTimes(2)
  })
})
