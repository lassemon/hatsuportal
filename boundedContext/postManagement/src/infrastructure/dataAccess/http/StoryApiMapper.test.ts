import { describe, expect, it } from 'vitest'
import { StoryApiMapper } from './StoryApiMapper'
import _ from 'lodash'
import { OrderEnum, StorySortableKeyEnum, VisibilityEnum } from '@hatsuportal/common'

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

    expect(dto.name).toBe(
      createRequest.name
        .split(' ')
        .map((namepart) => _.capitalize(namepart))
        .join(' ')
    )
    expect(dto.description).toBe(createRequest.description)
  })

  it('converts update request to update input dto', ({ unitFixture }) => {
    const updateRequest = unitFixture.updateStoryRequest()
    const dto = storyMapper.toUpdateStoryInputDTO(updateRequest, unitFixture.sampleStoryId, unitFixture.sampleUserId)

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
    expect(dto.name).toBe(updateRequest.name)
    expect(dto.description).toBe(updateRequest.description)
  })

  it('converts search request to search input dto', ({ unitFixture }) => {
    const searchRequest = unitFixture.searchStoriesRequest()
    const inputDTO = storyMapper.toStorySearchCriteriaDTO(searchRequest)
    expect(inputDTO.order).toBe(OrderEnum.Ascending)
    expect(inputDTO.orderBy).toBe(StorySortableKeyEnum.VISIBILITY)
    expect(inputDTO.storiesPerPage).toBe(50)
    expect(inputDTO.pageNumber).toBe(1)
    expect(inputDTO.loggedInCreatorId).toBeUndefined() // this is inserted in the use case
    expect(inputDTO.onlyMyStories).toBe(false)
    expect(inputDTO.search).toBe('search string')
    expect(inputDTO.visibility).toStrictEqual([VisibilityEnum.LoggedIn, VisibilityEnum.Private])
    expect(inputDTO.hasImage).toBe(false)
  })

  it('converts delete request to delete input dto', ({ unitFixture }) => {})

  // TODO, dont test mock against mock, use unitFicture.storyResponseMock() instead
  it('converts story dto to response', ({ unitFixture }) => {
    expect(storyMapper.toResponse(unitFixture.storyDTOMock())).toStrictEqual(unitFixture.storyDTOMock())
  })
})
