import { VisibilityEnum } from '@hatsuportal/common'
import { PostDTO } from '../PostDTO'

export interface StoryDTO extends Omit<PostDTO, 'postType'> {
  readonly visibility: VisibilityEnum
  readonly name: string
  readonly description: string
  readonly coverImageId: string | null
  readonly tagIds: string[]
}
