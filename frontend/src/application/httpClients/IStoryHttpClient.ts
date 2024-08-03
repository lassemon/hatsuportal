import { Maybe } from '@hatsuportal/common'
import {
  FetchOptions,
  SearchStoriesRequest,
  SearchStoriesResponse,
  StoryResponse,
  MyStoriesResponse,
  CreateStoryRequest,
  UpdateStoryRequest
} from '@hatsuportal/presentation'

export interface IStoryHttpClient {
  create(createRequest: CreateStoryRequest, options?: FetchOptions): Promise<StoryResponse>
  update(updateRequest: UpdateStoryRequest, options?: FetchOptions): Promise<StoryResponse>
  delete(storyId: string, options?: FetchOptions): Promise<StoryResponse>
  findById(storyId?: string, options?: FetchOptions): Promise<Maybe<StoryResponse>>
  findAll(options?: FetchOptions): Promise<SearchStoriesResponse>
  search(query: SearchStoriesRequest, options?: FetchOptions): Promise<SearchStoriesResponse>
  myStories(options?: FetchOptions): Promise<MyStoriesResponse>
}
