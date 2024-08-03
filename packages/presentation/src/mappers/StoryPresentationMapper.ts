import {
  CreateStoryInputDTO,
  DeleteStoryInputDTO,
  FindStoryInputDTO,
  StoryDTO,
  SearchStoriesInputDTO,
  UpdateStoryInputDTO
} from '@hatsuportal/application'
import { CreateStoryRequest } from '../api/requests/CreateStoryRequest'
import { UpdateStoryRequest } from '../api/requests/UpdateStoryRequest'
import { StoryResponse } from '../api/responses/StoryResponse'
import _ from 'lodash'
import { SearchStoriesRequest } from '../api/requests/SearchStoriesRequest'
import { InvalidRequestError } from '../errors/InvalidRequestError'
import { castToEnum, StorySortableKeyEnum, OrderEnum, validateAndCastEnum, VisibilityEnum } from '@hatsuportal/common'
import { StoryPresentation } from '../entities/StoryPresentation'

export interface IStoryPresentationMapper {
  toCreateStoryInputDTO(createStoryRequest: CreateStoryRequest, loggedInUserId?: string): CreateStoryInputDTO
  toUpdateStoryInputDTO(updateStoryRequest: UpdateStoryRequest, loggedInUserId?: string): UpdateStoryInputDTO
  toFindStoryInputDTO(storyIdToFind?: string, loggedInUserId?: string): FindStoryInputDTO
  toSearchStoriesInputDTO(searchStoriesRequest: SearchStoriesRequest, loggedInUserId?: string): SearchStoriesInputDTO
  toDeleteStoryInputDTO(storyIdToDelete?: string, loggedInUserId?: string): DeleteStoryInputDTO
  toResponse(story: StoryDTO): StoryResponse
  toStoryPresentation(response: StoryResponse): StoryPresentation
}

export class StoryPresentationMapper implements IStoryPresentationMapper {
  public toCreateStoryInputDTO(createRequest: CreateStoryRequest, loggedInUserId?: string): CreateStoryInputDTO {
    if (!loggedInUserId) {
      throw new InvalidRequestError('Invalid user authentication data.')
    }

    return {
      loggedInUserId,
      createStoryData: {
        visibility: validateAndCastEnum(createRequest.story.visibility, VisibilityEnum),
        imageId: null, // TODO, create request never contains an id for an image, should be leave it out here?
        name: createRequest.story.name
          .split(' ')
          .map((namepart) => _.capitalize(namepart))
          .join(' '),
        description: createRequest.story.description
      }
    }
  }

  public toUpdateStoryInputDTO(updateStoryRequest: UpdateStoryRequest, loggedInUserId?: string): UpdateStoryInputDTO {
    if (!loggedInUserId) {
      throw new InvalidRequestError('Invalid user authentication data.')
    }

    return {
      loggedInUserId,
      updateStoryData: {
        id: updateStoryRequest.story.id,
        ...(updateStoryRequest.story.visibility
          ? { visibility: validateAndCastEnum(updateStoryRequest.story.visibility, VisibilityEnum) }
          : {}),
        name: updateStoryRequest.story.name,
        description: updateStoryRequest.story.description,
        ...(updateStoryRequest.story.imageId ? { imageId: updateStoryRequest.story.imageId } : {})
      }
    }
  }

  toFindStoryInputDTO(storyIdToFind: string, loggedInUserId?: string): FindStoryInputDTO {
    if (!storyIdToFind) {
      throw new InvalidRequestError('Missing required path parameter "storyId"')
    }

    return {
      loggedInUserId,
      storyIdToFind
    }
  }

  public toSearchStoriesInputDTO(searchStoriesRequest: SearchStoriesRequest, loggedInUserId?: string): SearchStoriesInputDTO {
    let parsedVisibility: VisibilityEnum[] = []
    if (!_.isEmpty(searchStoriesRequest.visibility)) {
      parsedVisibility = _.uniq(searchStoriesRequest.visibility?.map((visibility) => validateAndCastEnum(visibility, VisibilityEnum)))
    }

    return {
      loggedInUserId,
      searchCriteria: {
        order: castToEnum(searchStoriesRequest.order, OrderEnum, OrderEnum.Ascending), // set default value when searching
        orderBy: castToEnum(searchStoriesRequest.orderBy, StorySortableKeyEnum, StorySortableKeyEnum.NAME), // set default value when searching
        storiesPerPage: searchStoriesRequest.storiesPerPage,
        pageNumber: searchStoriesRequest.pageNumber,
        onlyMyStories: searchStoriesRequest.onlyMyStories,
        search: searchStoriesRequest.search,
        visibility: _.compact(parsedVisibility),
        hasImage: searchStoriesRequest.hasImage
      }
    }
  }

  public toDeleteStoryInputDTO(storyIdToDelete?: string, loggedInUserId?: string): DeleteStoryInputDTO {
    if (!loggedInUserId) {
      throw new InvalidRequestError('Invalid user authentication data.')
    }

    if (!storyIdToDelete) {
      throw new InvalidRequestError('Missing required path parameter "storyId"')
    }

    return {
      loggedInUserId,
      storyIdToDelete
    }
  }

  public toResponse(story: StoryDTO): StoryResponse {
    return {
      id: story.id,
      visibility: story.visibility,
      createdBy: story.createdBy,
      createdByUserName: story.createdByUserName,
      createdAt: story.createdAt,
      updatedAt: story.updatedAt,
      imageId: story.imageId,
      name: story.name,
      description: story.description
    }
  }

  public toStoryPresentation(response: StoryResponse): StoryPresentation {
    return new StoryPresentation({
      id: response.id,
      name: response.name,
      description: response.description,
      imageId: response.imageId ?? '',
      visibility: validateAndCastEnum(response.visibility, VisibilityEnum),
      createdBy: response.createdBy,
      createdByUserName: response.createdByUserName,
      createdAt: response.createdAt,
      updatedAt: response.updatedAt
    })
  }
}
