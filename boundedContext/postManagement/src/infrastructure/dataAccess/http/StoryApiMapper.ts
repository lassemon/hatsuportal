import { IStoryApiMapper } from '../../../application/dataAccess/http/IStoryApiMapper'
import {
  CreateStoryInputDTO,
  DeleteStoryInputDTO,
  FindStoryInputDTO,
  RemoveImageFromStoryInputDTO,
  StorySearchCriteriaDTO,
  UpdateStoryImageInputDTO,
  UpdateStoryInputDTO,
  StoryDTO,
  StoryWithRelationsDTO
} from '../../../application/dtos'
import {
  CreateStoryRequest,
  SearchStoriesRequest,
  StoryResponse,
  StoryWithRelationsResponse,
  UpdateStoryRequest
} from '@hatsuportal/contracts'
import { InvalidRequestError } from '@hatsuportal/platform'
import _ from 'lodash'
import { castToEnum, OrderEnum, StorySortableKeyEnum, validateAndCastEnum, VisibilityEnum, withField } from '@hatsuportal/common'

const DEFAULT_STORIES_PER_PAGE = 50
const DEFAULT_PAGE_NUMBER = 0

export class StoryApiMapper implements IStoryApiMapper {
  constructor() {
    this.toResponseWithRelations = this.toResponseWithRelations.bind(this)
  }

  public toCreateStoryInputDTO(createRequest: CreateStoryRequest): CreateStoryInputDTO {
    return {
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

  public toUpdateStoryInputDTO(updateStoryRequest: UpdateStoryRequest, storyId: string, loggedInUserId?: string): UpdateStoryInputDTO {
    if (!loggedInUserId) {
      throw new InvalidRequestError('Invalid user authentication data.')
    }

    let updateStoryData: UpdateStoryInputDTO = {
      id: storyId
    }

    if (updateStoryRequest.visibility) {
      updateStoryData = withField(
        updateStoryData,
        'visibility',
        validateAndCastEnum(updateStoryRequest.visibility, VisibilityEnum)
      ) as UpdateStoryInputDTO
    }

    if (updateStoryRequest.name) {
      updateStoryData = withField(updateStoryData, 'name', updateStoryRequest.name) as UpdateStoryInputDTO
    }

    if (updateStoryRequest.description) {
      updateStoryData = withField(updateStoryData, 'description', updateStoryRequest.description) as UpdateStoryInputDTO
    }

    if (updateStoryRequest.tags) {
      updateStoryData = withField(updateStoryData, 'tags', updateStoryRequest.tags) as UpdateStoryInputDTO
    }

    // undefined: no change to image
    let updateStoryImageData: UpdateStoryImageInputDTO | null | undefined = undefined

    // null: remove image
    if (updateStoryRequest.image === null) {
      updateStoryImageData = null
    }

    // new image: replace image
    if (updateStoryRequest.image !== undefined && updateStoryRequest.image !== null) {
      updateStoryImageData = {
        mimeType: updateStoryRequest.image.mimeType,
        size: updateStoryRequest.image.size,
        base64: updateStoryRequest.image.base64
      }
    }

    return {
      ...updateStoryData,
      ...(updateStoryImageData !== undefined ? { image: updateStoryImageData } : {})
    }
  }

  toFindStoryInputDTO(storyIdToFind: string): FindStoryInputDTO {
    return {
      storyIdToFind
    }
  }

  public toStorySearchCriteriaDTO(searchStoriesRequest: SearchStoriesRequest): StorySearchCriteriaDTO {
    let parsedVisibility: VisibilityEnum[] = []
    if (!_.isEmpty(searchStoriesRequest.visibility)) {
      parsedVisibility = _.uniq(searchStoriesRequest.visibility?.map((visibility) => validateAndCastEnum(visibility, VisibilityEnum)))
    }

    return {
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

  public toDeleteStoryInputDTO(storyIdToDelete?: string, loggedInUserId?: string): DeleteStoryInputDTO {
    if (!loggedInUserId) {
      throw new InvalidRequestError('Invalid user authentication data.')
    }

    if (!storyIdToDelete) {
      throw new InvalidRequestError('Missing required path parameter "storyId"')
    }

    return {
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
      storyIdFromWhichToRemoveImage
    }
  }

  public toResponse(story: StoryDTO): StoryResponse {
    return {
      id: story.id,
      name: story.name,
      description: story.description,
      visibility: story.visibility,
      coverImageId: story.coverImageId,
      createdById: story.createdById,
      createdAt: story.createdAt,
      updatedAt: story.updatedAt,
      tagIds: story.tagIds
    }
  }

  public toResponseWithRelations(story: StoryWithRelationsDTO): StoryWithRelationsResponse {
    return {
      id: story.id,
      visibility: story.visibility,
      name: story.name,
      description: story.description,
      createdById: story.createdById,
      createdAt: story.createdAt,
      updatedAt: story.updatedAt,
      createdByName: story.createdByName,
      coverImage: story.coverImage,
      imageLoadState: story.imageLoadState,
      imageLoadError: story.imageLoadError ?? null,
      tags: story.tags,
      commentConnection: {
        totalCount: story.commentListChunk.comments.length,
        comments: story.commentListChunk.comments,
        nextCursor: story.commentListChunk.nextCursor
      }
    }
  }
}
