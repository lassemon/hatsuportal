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
import { castToEnum, StorySortableKeyEnum, OrderEnum, validateAndCastEnum, VisibilityEnum, PostTypeEnum } from '@hatsuportal/common'
import { StoryPresentation } from '../entities/StoryPresentation'
import { IImagePresentationMapper } from './ImagePresentationMapper'

export interface IStoryPresentationMapper {
  toCreateStoryRequest(story: StoryPresentation): CreateStoryRequest
  toUpdateStoryRequest(story: StoryPresentation): UpdateStoryRequest
  toCreateStoryInputDTO(createStoryRequest: CreateStoryRequest, loggedInUserId?: string): CreateStoryInputDTO
  toUpdateStoryInputDTO(updateStoryRequest: UpdateStoryRequest, loggedInUserId?: string): UpdateStoryInputDTO
  toFindStoryInputDTO(storyIdToFind?: string, loggedInUserId?: string): FindStoryInputDTO
  toSearchStoriesInputDTO(searchStoriesRequest: SearchStoriesRequest, loggedInUserId?: string): SearchStoriesInputDTO
  toDeleteStoryInputDTO(storyIdToDelete?: string, loggedInUserId?: string): DeleteStoryInputDTO
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
            visibility: story.image.visibility,
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
            visibility: story.image.visibility,
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
              visibility: validateAndCastEnum(createRequest.image?.visibility, VisibilityEnum),
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
                visibility: validateAndCastEnum(updateStoryRequest.image.visibility, VisibilityEnum),
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

  public toResponse(story: StoryDTO): StoryResponse {
    return {
      id: story.id,
      visibility: story.visibility,
      createdBy: story.createdBy,
      createdByUserName: story.createdByUserName,
      createdAt: story.createdAt,
      updatedAt: story.updatedAt,
      image: story.image,
      name: story.name,
      description: story.description
    }
  }

  public toStoryPresentation(response: StoryResponse): StoryPresentation {
    return new StoryPresentation({
      id: response.id,
      name: response.name,
      description: response.description,
      image: response.image ? this.imagePresentationMapper.toImagePresentationDTO(response.image) : null,
      visibility: validateAndCastEnum(response.visibility, VisibilityEnum),
      createdBy: response.createdBy,
      createdByUserName: response.createdByUserName,
      createdAt: response.createdAt,
      updatedAt: response.updatedAt
    })
  }
}
