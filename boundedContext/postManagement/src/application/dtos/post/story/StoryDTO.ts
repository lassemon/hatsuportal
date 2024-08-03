import { PostBaseDTO } from '../PostBaseDTO'

export interface StoryDTO extends Omit<PostBaseDTO, 'postType'> {
  readonly body: string
}
