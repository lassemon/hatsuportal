import { PostDatabaseSchema } from './PostDatabaseSchema'

export interface StoryDatabaseSchema extends PostDatabaseSchema {
  imageId: string | null
  name: string
  description: string
}
