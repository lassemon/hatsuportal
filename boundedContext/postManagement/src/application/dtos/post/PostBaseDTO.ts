import { PostDTO } from './PostDTO'

/**
 * Shared post fields for all post kinds (stories, etc.) in the write/read shape,
 * excluding story-only fields such as body.
 * Unlike the PostDTO that represents the DTO model of the posts table,
 * this DTO expresses the business intent for all post types shared data.
 * i.e. all posts have a visibility, name, coverImageId and tagIds
 * even though they are not stored in the master posts table.
 */
export interface PostBaseDTO extends PostDTO {
  readonly coverImageId: string | null
  readonly tagIds: string[]
}
