import { StoryDatabaseSchema } from './StoryDatabaseSchema'

export interface StoryReadDatabaseSchema extends StoryDatabaseSchema {
  createdByName: string
}
