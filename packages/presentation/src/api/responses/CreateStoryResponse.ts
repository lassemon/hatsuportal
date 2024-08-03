import { ImageResponse } from './ImageResponse'
import { StoryResponse } from './StoryResponse'

export interface CreateStoryResponse {
  story: StoryResponse
  image: ImageResponse | null
}
