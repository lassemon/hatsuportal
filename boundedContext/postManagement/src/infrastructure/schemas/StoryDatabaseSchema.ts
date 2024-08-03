import { PostDatabaseSchema } from './PostDatabaseSchema'

export interface StoryDatabaseSchema extends PostDatabaseSchema {
  name: string
  visibility: string
  description: string
  // coverImageId lives in story_image linking table but only the StoryWriteRepository must know about the linking table
  coverImageId: string | null
  // tagIds lives in story_tag linking table but only the StoryWriteRepository must know about the linking table
  tagIds: string[]
  // commentIds lives in story_comment linking table but only the StoryWriteRepository must know about the linking table
  commentIds: string[]
}
