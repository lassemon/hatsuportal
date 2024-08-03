import { StoryResponse } from './StoryResponse'

export interface SearchStoriesResponse {
  stories: StoryResponse[]
  totalCount: number
}
