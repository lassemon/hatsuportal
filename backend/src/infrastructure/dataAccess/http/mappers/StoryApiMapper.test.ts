import { describe, expect, it } from 'vitest'
import { StoryApiMapper } from './StoryApiMapper'
import _ from 'lodash'
import { StorySortableKeyEnum, OrderEnum, VisibilityEnum } from '@hatsuportal/common'

describe('StoryApiMapper', () => {
  const storyMapper = new StoryApiMapper()

  it('converts create request to create input dto', ({ unitFixture }) => {
    const createRequest = unitFixture.createStoryRequest()
    const dto = storyMapper.toCreateStoryInputDTO(createRequest, unitFixture.storyDTOMock().id)

    expect(dto.loggedInUserId).toBe(unitFixture.storyDTOMock().id)

    // common post properties
    expect((dto.createStoryData as any).id).toBeUndefined() // should not be given from request
    expect(dto.createStoryData.visibility).toBe(createRequest.visibility)
    expect((dto.createStoryData as any).createdById).toBeUndefined() // should not be given from request
    expect((dto.createStoryData as any).createdByName).toBeUndefined() // should not be given from request
    expect((dto.createStoryData as any).createdAt).toBeUndefined() // should not be given from request
    expect((dto.createStoryData as any).updatedAt).toBeUndefined() // should not be given from request

    // story properties
    expect((dto.createStoryData.image as any).id).toBeUndefined() // should not be given from request
    expect((dto.createStoryData.image as any).createdById).toBeUndefined() // should not be given from request
    expect((dto.createStoryData.image as any).createdByName).toBeUndefined() // should not be given from request
    expect((dto.createStoryData.image as any).createdAt).toBeUndefined() // should not be given from request
    expect((dto.createStoryData.image as any).updatedAt).toBeUndefined() // should not be given from request

    expect(dto.createStoryData.name).toBe(
      createRequest.name
        .split(' ')
        .map((namepart) => _.capitalize(namepart))
        .join(' ')
    )
    expect(dto.createStoryData.description).toBe(createRequest.description)
  })

  it('converts update request to update input dto', ({ unitFixture }) => {
    const updateRequest = unitFixture.updateStoryRequest()
    const dto = storyMapper.toUpdateStoryInputDTO(updateRequest, unitFixture.storyDTOMock().id)

    // common post properties
    expect(dto.loggedInUserId).toBe(unitFixture.storyDTOMock().id)
    expect(dto.updateStoryData.id).toBe(updateRequest.id)
    expect(dto.updateStoryData.visibility).toBe(updateRequest.visibility)
    expect((dto.updateStoryData as any).createdById).toBeUndefined() // should not be able to update from request
    expect((dto.updateStoryData as any).createdByName).toBeUndefined() // should not be able to update from request
    expect((dto.updateStoryData as any).createdAt).toBeUndefined() // should not be able to update from request
    expect((dto.updateStoryData as any).updatedAt).not.toBe((updateRequest as any).updatedAt) // should not be able to update from request

    // story properties
    expect(dto.updateStoryData.image).toStrictEqual({
      id: updateRequest.image?.id,
      mimeType: updateRequest.image?.mimeType,
      size: updateRequest.image?.size,
      base64: updateRequest.image?.base64
    })
    expect(dto.updateStoryData.name).toBe(updateRequest.name)
    expect(dto.updateStoryData.description).toBe(updateRequest.description)
  })

  it('converts search request to search input dto', ({ unitFixture }) => {
    const searchRequest = unitFixture.searchStoriesRequest()
    const inputDTO = storyMapper.toSearchStoriesInputDTO(searchRequest, unitFixture.storyDTOMock().id)
    expect(inputDTO.loggedInUserId).toBe(unitFixture.storyDTOMock().id)
    expect(inputDTO.searchCriteria.order).toBe(OrderEnum.Ascending)
    expect(inputDTO.searchCriteria.orderBy).toBe(StorySortableKeyEnum.VISIBILITY)
    expect(inputDTO.searchCriteria.storiesPerPage).toBe(50)
    expect(inputDTO.searchCriteria.pageNumber).toBe(1)
    expect(inputDTO.searchCriteria.loggedInCreatorId).toBeUndefined() // this is inserted in the use case
    expect(inputDTO.searchCriteria.onlyMyStories).toBe(false)
    expect(inputDTO.searchCriteria.search).toBe('search string')
    expect(inputDTO.searchCriteria.visibility).toStrictEqual([VisibilityEnum.LoggedIn, VisibilityEnum.Private])
    expect(inputDTO.searchCriteria.hasImage).toBe(false)
  })

  it('converts delete request to delete input dto', ({ unitFixture }) => {})

  it('converts story dto to response', ({ unitFixture }) => {
    expect(storyMapper.toResponse(unitFixture.storyDTOMock())).toStrictEqual(unitFixture.storyDTOMock())
  })
})
