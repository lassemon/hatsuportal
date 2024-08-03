import { describe, expect, it } from 'vitest'
import { PostApiMapper } from './PostApiMapper'
import { OrderEnum, SortableKeyEnum, VisibilityEnum, EntityTypeEnum, ImageStateEnum } from '@hatsuportal/common'
import { PostWithRelationsDTO } from '../../../application/dtos'

describe('PostApiMapper', () => {
  const postMapper = new PostApiMapper()

  it('converts search posts request to post search criteria dto', ({ unitFixture }) => {
    const searchRequest = unitFixture.searchPostsRequest()
    const inputDTO = postMapper.toPostSearchCriteriaDTO(searchRequest)
    expect(inputDTO.order).toBe(OrderEnum.Ascending)
    expect(inputDTO.orderBy).toBe(SortableKeyEnum.VISIBILITY)
    expect(inputDTO.postsPerPage).toBe(50)
    expect(inputDTO.pageNumber).toBe(1)
    expect(inputDTO.loggedInCreatorId).toBeUndefined()
    expect(inputDTO.search).toBe('search string')
    expect(inputDTO.visibility).toStrictEqual([VisibilityEnum.LoggedIn, VisibilityEnum.Private])
    expect(inputDTO.postType).toBeUndefined()
  })

  it('maps post with relations dto to API response', () => {
    const dto: PostWithRelationsDTO = {
      id: 'post-id',
      postType: EntityTypeEnum.Story,
      visibility: VisibilityEnum.Public,
      title: 'Title',
      createdById: 'creator',
      createdByName: 'Creator',
      createdAt: 1,
      updatedAt: 2,
      coverImage: null,
      imageLoadState: ImageStateEnum.NotSet,
      imageLoadError: null,
      tags: [
        {
          id: 'tag-1',
          slug: 't',
          name: 'Tag',
          createdById: 'c',
          createdAt: 1,
          updatedAt: 2
        }
      ]
    }

    const response = postMapper.toPostWithRelationsResponse(dto)
    expect(response.id).toBe('post-id')
    expect(response.postType).toBe(EntityTypeEnum.Story)
    expect(response.tagIds).toStrictEqual(['tag-1'])
    expect(response.tags).toHaveLength(1)
    expect(response.coverImageId).toBeNull()
  })
})
