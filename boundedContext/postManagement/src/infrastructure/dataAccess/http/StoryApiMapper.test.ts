import { describe, expect, it } from 'vitest'
import { StoryApiMapper } from './StoryApiMapper'
import _ from 'lodash'
import { OrderEnum, SortableKeyEnum, VisibilityEnum, ImageStateEnum } from '@hatsuportal/common'
import { InvalidRequestError } from '@hatsuportal/platform'

describe('StoryApiMapper', () => {
  const storyMapper = new StoryApiMapper()

  it('converts create request to create input dto', ({ unitFixture }) => {
    const createRequest = unitFixture.createStoryRequest()
    const dto = storyMapper.toCreateStoryInputDTO(createRequest)

    // common post properties
    expect((dto as any).id).toBeUndefined() // should not be given from request
    expect(dto.visibility).toBe(createRequest.visibility)
    expect((dto as any).createdById).toBeUndefined() // should not be given from request
    expect((dto as any).createdAt).toBeUndefined() // should not be given from request
    expect((dto as any).updatedAt).toBeUndefined() // should not be given from request

    // story properties
    expect((dto.image as any).id).toBeUndefined() // should not be given from request
    expect((dto.image as any).createdById).toBeUndefined() // should not be given from request
    expect((dto.image as any).createdAt).toBeUndefined() // should not be given from request
    expect((dto.image as any).updatedAt).toBeUndefined() // should not be given from request

    expect(dto.title).toBe(
      createRequest.title
        .split(' ')
        .map((namepart) => _.capitalize(namepart))
        .join(' ')
    )
    expect(dto.body).toBe(createRequest.body)
  })

  it('converts update request to update input dto', ({ unitFixture }) => {
    const updateRequest = unitFixture.updateStoryRequest()
    const dto = storyMapper.toUpdateStoryInputDTO(updateRequest, unitFixture.sampleStoryId)

    // common post properties
    expect(dto.id).toBe(unitFixture.sampleStoryId)
    expect(dto.visibility).toBe(updateRequest.visibility)
    expect((dto as any).createdById).toBeUndefined() // should not be able to update from request
    expect((dto as any).createdAt).toBeUndefined() // should not be able to update from request
    expect((dto as any).updatedAt).not.toBe((updateRequest as any).updatedAt) // should not be able to update from request

    // story properties
    expect(dto.image).toStrictEqual({
      mimeType: updateRequest.image?.mimeType,
      size: updateRequest.image?.size,
      base64: updateRequest.image?.base64
    })
    expect(dto.title).toBe(updateRequest.title)
    expect(dto.body).toBe(updateRequest.body)
  })

  it('converts search request to search input dto', ({ unitFixture }) => {
    const searchRequest = unitFixture.searchStoriesRequest()
    const inputDTO = storyMapper.toStorySearchCriteriaDTO(searchRequest)
    expect(inputDTO.order).toBe(OrderEnum.Ascending)
    expect(inputDTO.orderBy).toBe(SortableKeyEnum.VISIBILITY)
    expect(inputDTO.storiesPerPage).toBe(50)
    expect(inputDTO.pageNumber).toBe(1)
    expect(inputDTO.loggedInCreatorId).toBeUndefined() // this is inserted in the use case
    expect(inputDTO.onlyMyStories).toBe(false)
    expect(inputDTO.search).toBe('search string')
    expect(inputDTO.visibility).toStrictEqual([VisibilityEnum.LoggedIn, VisibilityEnum.Private])
    expect(inputDTO.hasImage).toBe(false)
  })

  it('converts delete request to delete input dto', ({ unitFixture }) => {
    expect(storyMapper.toDeleteStoryInputDTO(unitFixture.sampleStoryId)).toEqual({
      storyIdToDelete: unitFixture.sampleStoryId
    })
    expect(() => storyMapper.toDeleteStoryInputDTO(undefined)).toThrow(InvalidRequestError)
  })

  it('converts find request to find input dto', ({ unitFixture }) => {
    expect(storyMapper.toFindStoryInputDTO(unitFixture.sampleStoryId)).toEqual({
      storyIdToFind: unitFixture.sampleStoryId
    })
  })

  it('rejects invalid tag input on create', ({ unitFixture }) => {
    const createRequest = unitFixture.createStoryRequest()
    createRequest.tags = [{ id: 'tag-id', name: 'also-name' } as never]
    expect(() => storyMapper.toCreateStoryInputDTO(createRequest)).toThrow(InvalidRequestError)
  })

  it('converts story with relations to response with relations', ({ unitFixture }) => {
    const story = {
      ...unitFixture.storyReadModelDTOMock(),
      createdByName: 'Test User',
      coverImage: null,
      imageLoadState: ImageStateEnum.NotSet,
      imageLoadError: null,
      tags: [unitFixture.tagDTOMock()],
      commentListChunk: { comments: [unitFixture.commentWithRelationsDTOMock()], nextCursor: null }
    }

    const response = storyMapper.toResponseWithRelations(story)
    expect(response.id).toBe(unitFixture.sampleStoryId)
    expect(response.commentConnection.totalCount).toBe(1)
  })

  it('converts story dto to response', ({ unitFixture }) => {
    expect(storyMapper.toResponse(unitFixture.storyDTOMock())).toStrictEqual(unitFixture.storyResponseMock())
  })
})
