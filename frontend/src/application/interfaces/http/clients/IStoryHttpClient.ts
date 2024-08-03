import {
  SearchStoriesRequest,
  SearchStoriesResponse,
  MyStoriesResponse,
  CreateStoryRequest,
  UpdateStoryRequest,
  FetchOptions,
  StoryWithRelationsResponse
} from '@hatsuportal/contracts'
import { Maybe } from '@hatsuportal/common'

export interface IStoryHttpClient {
  create(createRequest: CreateStoryRequest, options?: FetchOptions): Promise<StoryWithRelationsResponse>
  update(storyId: string, updateRequest: UpdateStoryRequest, options?: FetchOptions): Promise<StoryWithRelationsResponse>
  delete(storyId: string, options?: FetchOptions): Promise<StoryWithRelationsResponse>
  findById(storyId?: string, options?: FetchOptions): Promise<Maybe<StoryWithRelationsResponse>>
  findAll(options?: FetchOptions): Promise<SearchStoriesResponse>
  search(query: SearchStoriesRequest, options?: FetchOptions): Promise<SearchStoriesResponse>
  myStories(options?: FetchOptions): Promise<MyStoriesResponse>
}
