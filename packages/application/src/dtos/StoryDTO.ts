import { ImageDTO } from './ImageDTO'
import { PostDTO } from './PostDTO'

export interface StoryDTO extends PostDTO {
  image: ImageDTO | null
  name: string
  description: string
}
