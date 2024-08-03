import { Maybe } from '@hatsuportal/common'
import { FetchOptions, SearchStoriesRequest } from '@hatsuportal/contracts'
import { StoryViewModel } from 'ui/features/story/viewModels/StoryViewModel'

export interface StoryListResponse {
  stories: StoryViewModel[]
  totalCount: number
}

export interface IStoryService {
  findAll(options?: FetchOptions): Promise<StoryListResponse>
  search(query: SearchStoriesRequest, options?: FetchOptions): Promise<StoryListResponse>
  myStories(options?: FetchOptions): Promise<StoryListResponse>
  findById(storyId?: string, options?: FetchOptions): Promise<Maybe<StoryViewModel>>
  create(story: StoryViewModel, options?: FetchOptions): Promise<StoryViewModel>
  update(story: StoryViewModel, options?: FetchOptions): Promise<StoryViewModel>
  delete(storyId: string, options?: FetchOptions): Promise<StoryViewModel>
  storeToLocalStorage(story: StoryViewModel): Promise<StoryViewModel>
}
