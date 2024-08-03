import { CreateStoryRequest, UpdateStoryRequest, StoryResponse } from '@hatsuportal/contracts'
import { StoryViewModel } from 'ui/features/story/viewModels/StoryViewModel'

export interface IStoryViewModelMapper {
  toCreateStoryRequest(story: StoryViewModel): CreateStoryRequest
  toUpdateStoryRequest(story: StoryViewModel): UpdateStoryRequest
  toViewModel(response: StoryResponse): StoryViewModel
}
