import { StoryDTO } from './StoryDTO'

export interface StoryReadModelDTO extends StoryDTO {
  readonly createdByName: string
  /**
   * commentIds are not a part of StoryDTO because they
   * are not a direct part of the story Aggregate.
   * They belong to the Comment aggregate and are enriched in read operations.
   * StoryDTO is part of the write model, while StoryReadModelDTO is part of the read model.
   */
  readonly commentIds: string[]
}
