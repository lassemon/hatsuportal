import {
  CreateStoryRequest,
  SearchStoriesRequest,
  StoryResponse,
  StoryWithRelationsResponse,
  UpdateStoryRequest
} from '@hatsuportal/contracts'
import {
  CreateStoryInputDTO,
  DeleteStoryInputDTO,
  FindStoryInputDTO,
  RemoveImageFromStoryInputDTO,
  StorySearchCriteriaDTO,
  UpdateStoryInputDTO
} from '../../dtos'
import { StoryDTO, StoryWithRelationsDTO } from '../../dtos'

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
