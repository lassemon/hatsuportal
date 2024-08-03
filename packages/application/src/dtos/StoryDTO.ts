import { PostDTO } from './PostDTO'

export interface StoryDTO extends PostDTO {
  imageId: string | null
  name: string
  description: string
}
