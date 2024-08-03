import { Maybe } from '@hatsuportal/common'
import { ImagePresentation, StoryPresentation, SearchStoriesRequest, FetchOptions } from '@hatsuportal/presentation'

export interface StoryListResponse {
  stories: StoryPresentation[]
  totalCount: number
}

export interface StoryWithImageResponse {
  story: StoryPresentation
  image: Maybe<ImagePresentation>
}

export interface IStoryService {
  findAll(options?: FetchOptions): Promise<StoryListResponse>
  search(query: SearchStoriesRequest, options?: FetchOptions): Promise<StoryListResponse>
  myStories(options?: FetchOptions): Promise<StoryListResponse>
  findById(storyId?: string, options?: FetchOptions): Promise<Maybe<StoryPresentation>>
  create(story: StoryPresentation, image?: ImagePresentation | null, options?: FetchOptions): Promise<StoryWithImageResponse>
  update(story: StoryPresentation, imageMetadata?: ImagePresentation | null, options?: FetchOptions): Promise<StoryWithImageResponse>
  delete(storyId: string, options?: FetchOptions): Promise<StoryPresentation>
  storeToLocalStorage(story: StoryPresentation): Promise<StoryPresentation>
}
