import { StoryDTO } from './StoryDTO'

export interface StoryReadModelDTO extends StoryDTO {
  readonly createdByName: string
  readonly coverImageId: string | null
  readonly tagIds: string[]
  readonly commentIds: string[]
}
