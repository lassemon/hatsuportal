import { Maybe } from '@hatsuportal/common'
import { StoryPresentation, SearchStoriesRequest } from '@hatsuportal/presentation-post'
import { FetchOptions } from '@hatsuportal/presentation-common'

export interface StoryListResponse {
  stories: StoryPresentation[]
  totalCount: number
}

export interface IStoryService {
  findAll(options?: FetchOptions): Promise<StoryListResponse>
  search(query: SearchStoriesRequest, options?: FetchOptions): Promise<StoryListResponse>
  myStories(options?: FetchOptions): Promise<StoryListResponse>
  findById(storyId?: string, options?: FetchOptions): Promise<Maybe<StoryPresentation>>
  create(story: StoryPresentation, options?: FetchOptions): Promise<StoryPresentation>
  update(story: StoryPresentation, options?: FetchOptions): Promise<StoryPresentation>
  delete(storyId: string, options?: FetchOptions): Promise<StoryPresentation>
  storeToLocalStorage(story: StoryPresentation): Promise<StoryPresentation>
}
