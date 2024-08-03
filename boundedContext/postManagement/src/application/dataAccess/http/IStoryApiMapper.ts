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
  toCreateStoryInputDTO(createStoryRequest: CreateStoryRequest): CreateStoryInputDTO
  toUpdateStoryInputDTO(updateStoryRequest: UpdateStoryRequest, storyId: string): UpdateStoryInputDTO
  toFindStoryInputDTO(storyIdToFind: string): FindStoryInputDTO
  toStorySearchCriteriaDTO(searchStoriesRequest: SearchStoriesRequest): StorySearchCriteriaDTO
  toDeleteStoryInputDTO(storyIdToDelete?: string): DeleteStoryInputDTO
  toRemoveImageFromStoryInputDTO(storyIdFromWhichToRemoveImage?: string): RemoveImageFromStoryInputDTO
  toResponse(story: StoryDTO): StoryResponse
  toResponseWithRelations(story: StoryWithRelationsDTO): StoryWithRelationsResponse
}
