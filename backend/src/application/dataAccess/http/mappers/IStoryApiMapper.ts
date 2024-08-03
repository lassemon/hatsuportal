import {
  SearchStoriesRequest,
  UpdateStoryRequest,
  StoryResponse,
  CreateStoryRequest,
  StoryWithRelationsResponse
} from '@hatsuportal/contracts'
import {
  CreateStoryInputDTO,
  DeleteStoryInputDTO,
  FindStoryInputDTO,
  RemoveImageFromStoryInputDTO,
  StorySearchCriteriaDTO,
  StoryDTO,
  StoryWithRelationsDTO,
  UpdateStoryInputDTO
} from '@hatsuportal/post-management'

export interface IStoryApiMapper {
  toCreateStoryInputDTO(createStoryRequest: CreateStoryRequest, loggedInUserId?: string): CreateStoryInputDTO
  toUpdateStoryInputDTO(updateStoryRequest: UpdateStoryRequest, storyId: string, loggedInUserId?: string): UpdateStoryInputDTO
  toFindStoryInputDTO(storyIdToFind: string): FindStoryInputDTO
  toStorySearchCriteriaDTO(searchStoriesRequest: SearchStoriesRequest, loggedInUserId?: string): StorySearchCriteriaDTO
  toDeleteStoryInputDTO(storyIdToDelete?: string, loggedInUserId?: string): DeleteStoryInputDTO
  toRemoveImageFromStoryInputDTO(storyIdFromWhichToRemoveImage?: string, loggedInUserId?: string): RemoveImageFromStoryInputDTO
  toResponse(story: StoryDTO): StoryResponse
  toResponseWithRelations(story: StoryWithRelationsDTO): StoryWithRelationsResponse
}
