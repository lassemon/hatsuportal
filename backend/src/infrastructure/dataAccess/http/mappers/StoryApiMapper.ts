import { IStoryApiMapper } from '/application/dataAccess/http/mappers/IStoryApiMapper'
import { CreateStoryRequest, UpdateStoryRequest, SearchStoriesRequest, StoryResponse } from '@hatsuportal/contracts'
import {
  CreateStoryInputDTO,
  UpdateStoryInputDTO,
  FindStoryInputDTO,
  SearchStoriesInputDTO,
  DeleteStoryInputDTO,
  RemoveImageFromStoryInputDTO,
  StoryDTO
} from '@hatsuportal/post-management'
import { InvalidRequestError } from 'infrastructure/errors/InvalidRequestError'
import { VisibilityEnum, validateAndCastEnum } from '@hatsuportal/common'
import { OrderEnum, castToEnum } from '@hatsuportal/common'
import { StorySortableKeyEnum } from '@hatsuportal/common'
import _ from 'lodash'

const DEFAULT_STORIES_PER_PAGE = 50
const DEFAULT_PAGE_NUMBER = 0

export class StoryApiMapper implements IStoryApiMapper {
  public toCreateStoryInputDTO(createRequest: CreateStoryRequest, loggedInUserId?: string): CreateStoryInputDTO {
    if (!loggedInUserId) {
      throw new InvalidRequestError('Invalid user authentication data.')
    }

    return {
      loggedInUserId,
      createStoryData: {
        visibility: validateAndCastEnum(createRequest.visibility, VisibilityEnum),
        image: createRequest.image
          ? {
              mimeType: createRequest.image?.mimeType,
              size: createRequest.image?.size,
              base64: createRequest.image?.base64
            }
          : null,
        name: createRequest.name
          .split(' ')
          .map((namepart) => _.capitalize(namepart))
          .join(' '),
        description: createRequest.description
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
        id: updateStoryRequest.id,
        ...(updateStoryRequest.visibility ? { visibility: validateAndCastEnum(updateStoryRequest.visibility, VisibilityEnum) } : {}),
        name: updateStoryRequest.name,
        description: updateStoryRequest.description,
        ...(updateStoryRequest.image
          ? {
              image: {
                id: updateStoryRequest.image.id,
                mimeType: updateStoryRequest.image.mimeType,
                size: updateStoryRequest.image.size,
                base64: updateStoryRequest.image.base64
              }
            }
          : {})
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
        storiesPerPage: searchStoriesRequest.storiesPerPage ?? DEFAULT_STORIES_PER_PAGE,
        pageNumber: searchStoriesRequest.pageNumber ?? DEFAULT_PAGE_NUMBER,
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

  public toRemoveImageFromStoryInputDTO(storyIdFromWhichToRemoveImage: string, loggedInUserId?: string): RemoveImageFromStoryInputDTO {
    if (!loggedInUserId) {
      throw new InvalidRequestError('Invalid user authentication data.')
    }

    if (!storyIdFromWhichToRemoveImage) {
      throw new InvalidRequestError('Missing required path parameter "storyId"')
    }

    return {
      loggedInUserId,
      storyIdFromWhichToRemoveImage
    }
  }

  public toResponse(story: StoryDTO): StoryResponse {
    return {
      id: story.id,
      name: story.name,
      description: story.description,
      visibility: story.visibility,
      createdById: story.createdById,
      createdByName: story.createdByName,
      createdAt: story.createdAt,
      updatedAt: story.updatedAt,
      image: story.image,
      imageLoadState: story.imageLoadState,
      imageLoadError: story.imageLoadError ?? null
    }
  }
}
