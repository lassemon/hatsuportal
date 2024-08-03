import { describe, expect, it } from 'vitest'
import { EntityTypeEnum, OrderEnum, SortableKeyEnum, VisibilityEnum, ImageStateEnum } from '@hatsuportal/common'
import { PostApplicationMapper } from './PostApplicationMapper'
import * as Fixture from '../../__test__/testFactory'

describe('PostApplicationMapper', () => {
  const mapper = new PostApplicationMapper()

  it('maps story with relations to post with relations', () => {
    const story = {
      ...Fixture.storyReadModelDTOMock(),
      createdByName: 'Test User',
      coverImage: null,
      imageLoadState: ImageStateEnum.NotSet,
      imageLoadError: null,
      tags: [Fixture.tagDTOMock()],
      commentListChunk: { comments: [], nextCursor: null }
    }

    const post = mapper.fromStoryWithRelations(story)

    expect(post.postType).toBe(EntityTypeEnum.Story)
    expect(post.id).toBe(story.id)
    expect(post.title).toBe(story.title)
    expect(post.tags).toEqual(story.tags)
  })

  it('maps post search criteria to story search criteria', () => {
    const criteria = mapper.toStorySearchCriteria({
      order: OrderEnum.Descending,
      orderBy: SortableKeyEnum.CREATED_AT,
      postsPerPage: 25,
      pageNumber: 2,
      search: 'query',
      visibility: [VisibilityEnum.Public]
    })

    expect(criteria.storiesPerPage).toBe(25)
    expect(criteria.onlyMyStories).toBe(false)
    expect(criteria.hasImage).toBeUndefined()
    expect(criteria.visibility).toEqual([VisibilityEnum.Public])
  })
})
