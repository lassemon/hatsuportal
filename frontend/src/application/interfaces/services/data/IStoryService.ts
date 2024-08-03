import { CreateStoryRequest, FetchOptions, SearchStoriesRequest, UpdateStoryRequest } from '@hatsuportal/contracts'
import { Maybe } from '@hatsuportal/common'
import { StoryViewModel } from 'ui/features/post/story/viewModels/StoryViewModel'

export interface StoryListResponse {
  stories: StoryViewModel[]
  totalCount: number
}

export interface IStoryService {
  findAll(options?: FetchOptions): Promise<StoryListResponse>
  search(query: SearchStoriesRequest, options?: FetchOptions): Promise<StoryListResponse>
  myStories(options?: FetchOptions): Promise<StoryListResponse>
  findById(storyId?: string, options?: FetchOptions): Promise<Maybe<StoryViewModel>>
  create(story: CreateStoryRequest, options?: FetchOptions): Promise<StoryViewModel>
  update(storyId: string, story: UpdateStoryRequest, options?: FetchOptions): Promise<StoryViewModel>
  delete(storyId: string, options?: FetchOptions): Promise<StoryViewModel>
  storeToLocalStorage(story: StoryViewModel): Promise<StoryViewModel>
}
