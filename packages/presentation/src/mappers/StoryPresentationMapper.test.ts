import { describe, expect, it } from 'vitest'
import { StoryPresentationMapper } from './StoryPresentationMapper'
import _ from 'lodash'
import { StorySortableKeyEnum, OrderEnum, VisibilityEnum } from '@hatsuportal/common'
import { StoryPresentation } from '../entities/StoryPresentation'

describe('StoryPresentationMapper', () => {
  const storyMapper = new StoryPresentationMapper()

  it('converts create request to create input dto', ({ unitFixture }) => {
    const createRequest = unitFixture.createStoryRequest()
    const dto = storyMapper.toCreateStoryInputDTO(createRequest, unitFixture.loggedInUserId())

    expect(dto.loggedInUserId).toBe(unitFixture.loggedInUserId())

    // common post properties
    expect((dto.createStoryData as any).id).toBeUndefined() // should not be given from request
    expect(dto.createStoryData.visibility).toBe(createRequest.story.visibility)
    expect((dto.createStoryData as any).createdBy).toBeUndefined() // should not be given from request
    expect((dto.createStoryData as any).createdByUserName).toBeUndefined() // should not be given from request
    expect((dto.createStoryData as any).createdAt).toBeUndefined() // should not be given from request
    expect((dto.createStoryData as any).updatedAt).toBeUndefined() // should not be given from request

    // story properties
    expect(dto.createStoryData.imageId).toBeNull() // should always be null because image id is linked to the story only after the storing of image succeeds
    expect(dto.createStoryData.name).toBe(
      createRequest.story.name
        .split(' ')
        .map((namepart) => _.capitalize(namepart))
        .join(' ')
    )
    expect(dto.createStoryData.description).toBe(createRequest.story.description)
  })

  it('converts update request to update input dto', ({ unitFixture }) => {
    const updateRequest = unitFixture.updateStoryRequest()
    const dto = storyMapper.toUpdateStoryInputDTO(updateRequest, unitFixture.loggedInUserId())

    // common post properties
    expect(dto.loggedInUserId).toBe(unitFixture.loggedInUserId())
    expect(dto.updateStoryData.id).toBe(updateRequest.story.id)
    expect(dto.updateStoryData.visibility).toBe(updateRequest.story.visibility)
    expect((dto.updateStoryData as any).createdBy).toBeUndefined() // should not be able to update from request
    expect((dto.updateStoryData as any).createdByUserName).toBeUndefined() // should not be able to update from request
    expect((dto.updateStoryData as any).createdAt).toBeUndefined() // should not be able to update from request
    expect((dto.updateStoryData as any).updatedAt).not.toBe((updateRequest as any).story.updatedAt) // should not be able to update from request

    // story properties
    expect(dto.updateStoryData.imageId).toBe(updateRequest.story.imageId)
    expect(dto.updateStoryData.name).toBe(updateRequest.story.name)
    expect(dto.updateStoryData.description).toBe(updateRequest.story.description)
  })

  it('converts search request to search input dto', ({ unitFixture }) => {
    const searchRequest = unitFixture.searchStoriesRequest()
    const inputDTO = storyMapper.toSearchStoriesInputDTO(searchRequest, unitFixture.loggedInUserId())
    expect(inputDTO.loggedInUserId).toBe(unitFixture.loggedInUserId())
    expect(inputDTO.searchCriteria.order).toBe(OrderEnum.Ascending)
    expect(inputDTO.searchCriteria.orderBy).toBe(StorySortableKeyEnum.VISIBILITY)
    expect(inputDTO.searchCriteria.storiesPerPage).toBe(50)
    expect(inputDTO.searchCriteria.pageNumber).toBe(1)
    expect(inputDTO.searchCriteria.loggedInUserId).toBeUndefined() // this is inserted in the use case
    expect(inputDTO.searchCriteria.onlyMyStories).toBe(false)
    expect(inputDTO.searchCriteria.search).toBe('search string')
    expect(inputDTO.searchCriteria.visibility).toStrictEqual([VisibilityEnum.LoggedIn, VisibilityEnum.Private])
    expect(inputDTO.searchCriteria.hasImage).toBe(false)
  })

  it('converts delete request to delete input dto', ({ unitFixture }) => {})

  it('converts story dto to response', ({ unitFixture }) => {
    expect(storyMapper.toResponse(unitFixture.storyDTO())).toStrictEqual(unitFixture.storyDTO())
  })

  it('converts story response to StoryPresentation entity', ({ unitFixture }) => {
    expect(storyMapper.toStoryPresentation(unitFixture.storyDTO())).toBeInstanceOf(StoryPresentation)
  })
})
