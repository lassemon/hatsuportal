import { CreateStoryRequest, UpdateStoryRequest, StoryWithRelationsResponse } from '@hatsuportal/contracts'
import { StoryViewModel } from 'ui/features/post/story/viewModels/StoryViewModel'

export interface IStoryViewModelMapper {
  toCreateStoryRequest(createPayload: CreateStoryRequest): CreateStoryRequest
  toUpdateStoryRequest(updatePayload: UpdateStoryRequest): UpdateStoryRequest
  toViewModel(response: StoryWithRelationsResponse): StoryViewModel
}
