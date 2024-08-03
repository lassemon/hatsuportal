import { describe, expect, it } from 'vitest'
import { PostQueryFacade } from './PostQueryFacade'
import { PostQueryMapper } from './mappers/PostQueryMapper'
import * as Fixture from '../../../__test__/testFactory'
import { ImageStateEnum } from '@hatsuportal/common'

describe('PostQueryFacade', () => {
  it('returns story contracts for creator', async () => {
    const storyLookupService = Fixture.storyLookupServiceMock()
    storyLookupService.findAllForCreator.mockResolvedValue([
      {
        ...Fixture.storyReadModelDTOMock(),
        createdByName: 'Test User',
        coverImage: null,
        imageLoadState: ImageStateEnum.NotSet,
        imageLoadError: null,
        tags: [],
        commentListChunk: { comments: [], nextCursor: null }
      }
    ])
    const facade = new PostQueryFacade(storyLookupService, new PostQueryMapper())

    const result = await facade.getStoriesByCreatorId(Fixture.sampleUserId)

    expect(storyLookupService.findAllForCreator).toHaveBeenCalledTimes(1)
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe(Fixture.sampleStoryId)
  })
})
