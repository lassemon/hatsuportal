import { CreateStoryRequest, UpdateStoryRequest, StoryWithRelationsResponse } from '@hatsuportal/contracts'
import { StoryViewModel } from 'ui/entities/story/model/StoryViewModel'

export interface IStoryViewModelMapper {
  toCreateStoryRequest(createPayload: CreateStoryRequest): CreateStoryRequest
  toUpdateStoryRequest(updatePayload: UpdateStoryRequest): UpdateStoryRequest
  toViewModel(response: StoryWithRelationsResponse): StoryViewModel
}
