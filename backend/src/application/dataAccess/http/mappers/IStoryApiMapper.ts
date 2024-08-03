import { SearchStoriesRequest, UpdateStoryRequest, StoryResponse, CreateStoryRequest } from '@hatsuportal/contracts'
import {
  CreateStoryInputDTO,
  DeleteStoryInputDTO,
  FindStoryInputDTO,
  RemoveImageFromStoryInputDTO,
  SearchStoriesInputDTO,
  StoryDTO,
  UpdateStoryInputDTO
} from '@hatsuportal/post-management'

export interface IStoryApiMapper {
  toCreateStoryInputDTO(createStoryRequest: CreateStoryRequest, loggedInUserId?: string): CreateStoryInputDTO
  toUpdateStoryInputDTO(updateStoryRequest: UpdateStoryRequest, loggedInUserId?: string): UpdateStoryInputDTO
  toFindStoryInputDTO(storyIdToFind?: string, loggedInUserId?: string): FindStoryInputDTO
  toSearchStoriesInputDTO(searchStoriesRequest: SearchStoriesRequest, loggedInUserId?: string): SearchStoriesInputDTO
  toDeleteStoryInputDTO(storyIdToDelete?: string, loggedInUserId?: string): DeleteStoryInputDTO
  toRemoveImageFromStoryInputDTO(storyIdFromWhichToRemoveImage?: string, loggedInUserId?: string): RemoveImageFromStoryInputDTO
  toResponse(story: StoryDTO): StoryResponse
}
