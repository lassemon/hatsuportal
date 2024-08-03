import { Maybe } from '@hatsuportal/common'
import {
  FetchOptions,
  ImagePresentation,
  StoryPresentation,
  SearchStoriesRequest,
  SearchStoriesResponse,
  CreateStoryResponse,
  UpdateStoryResponse,
  StoryResponse,
  MyStoriesResponse
} from '@hatsuportal/presentation'

export interface IStoryHttpClient {
  create(story: StoryPresentation, image?: ImagePresentation | null, options?: FetchOptions): Promise<CreateStoryResponse>
  update(story: StoryPresentation, imageMetadata?: ImagePresentation | null, options?: FetchOptions): Promise<UpdateStoryResponse>
  delete(storyId: string, options?: FetchOptions): Promise<StoryResponse>
  findById(storyId?: string, options?: FetchOptions): Promise<Maybe<StoryResponse>>
  findAll(options?: FetchOptions): Promise<SearchStoriesResponse>
  search(query: SearchStoriesRequest, options?: FetchOptions): Promise<SearchStoriesResponse>
  myStories(options?: FetchOptions): Promise<MyStoriesResponse>
}
