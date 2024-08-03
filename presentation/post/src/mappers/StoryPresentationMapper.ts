import {
  CreateStoryInputDTO,
  DeleteStoryInputDTO,
  FindStoryInputDTO,
  StoryDTO,
  SearchStoriesInputDTO,
  UpdateStoryInputDTO,
  RemoveImageFromStoryInputDTO
} from '@hatsuportal/post-management'
import { CreateStoryRequest } from '../api/requests/CreateStoryRequest'
import { UpdateStoryRequest } from '../api/requests/UpdateStoryRequest'
import { StoryResponse } from '../api/responses/StoryResponse'
import _ from 'lodash'
import { SearchStoriesRequest } from '../api/requests/SearchStoriesRequest'
import { castToEnum, StorySortableKeyEnum, OrderEnum, validateAndCastEnum, VisibilityEnum, ImageStateEnum } from '@hatsuportal/common'
import { StoryPresentation } from '../entities/StoryPresentation'
import { IImagePresentationMapper } from '@hatsuportal/presentation-common'
import { InvalidRequestError } from '@hatsuportal/presentation-common'

export interface IStoryPresentationMapper {
  toCreateStoryRequest(story: StoryPresentation): CreateStoryRequest
  toUpdateStoryRequest(story: StoryPresentation): UpdateStoryRequest
  toCreateStoryInputDTO(createStoryRequest: CreateStoryRequest, loggedInUserId?: string): CreateStoryInputDTO
  toUpdateStoryInputDTO(updateStoryRequest: UpdateStoryRequest, loggedInUserId?: string): UpdateStoryInputDTO
  toFindStoryInputDTO(storyIdToFind?: string, loggedInUserId?: string): FindStoryInputDTO
  toSearchStoriesInputDTO(searchStoriesRequest: SearchStoriesRequest, loggedInUserId?: string): SearchStoriesInputDTO
  toDeleteStoryInputDTO(storyIdToDelete?: string, loggedInUserId?: string): DeleteStoryInputDTO
  toRemoveImageFromStoryInputDTO(storyIdFromWhichToRemoveImage?: string, loggedInUserId?: string): RemoveImageFromStoryInputDTO
  toResponse(story: StoryDTO): StoryResponse
  toStoryPresentation(response: StoryResponse): StoryPresentation
}

export class StoryPresentationMapper implements IStoryPresentationMapper {
  constructor(private readonly imagePresentationMapper: IImagePresentationMapper) {}

  public toCreateStoryRequest(story: StoryPresentation): CreateStoryRequest {
    return {
      visibility: story.visibility,
      image: story.image
        ? {
            mimeType: story.image.mimeType,
            size: story.image.size,
            base64: story.image.base64
          }
        : null,
      name: story.name,
      description: story.description
    }
  }

  public toUpdateStoryRequest(story: StoryPresentation): UpdateStoryRequest {
    return {
      id: story.id,
      visibility: story.visibility,
      image: story.image
        ? {
            id: story.image.id,
            mimeType: story.image.mimeType,
            size: story.image.size,
            base64: story.image.base64
          }
        : null,
      name: story.name,
      description: story.description
    }
  }

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

  public toStoryPresentation(response: StoryResponse): StoryPresentation {
    return new StoryPresentation({
      id: response.id,
      name: response.name,
      description: response.description,
      visibility: validateAndCastEnum(response.visibility, VisibilityEnum),
      createdById: response.createdById,
      createdByName: response.createdByName,
      createdAt: response.createdAt,
      updatedAt: response.updatedAt,
      image: response.image ? this.imagePresentationMapper.toImagePresentationDTO(response.image) : null,
      imageLoadState: response.imageLoadState,
      imageLoadError: response.imageLoadError ?? null
    })
  }
}
