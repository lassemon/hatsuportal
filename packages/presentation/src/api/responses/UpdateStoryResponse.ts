import { ImageResponse } from './ImageResponse'
import { StoryResponse } from './StoryResponse'

export interface UpdateStoryResponse {
  story: StoryResponse
  image: ImageResponse | null
}
