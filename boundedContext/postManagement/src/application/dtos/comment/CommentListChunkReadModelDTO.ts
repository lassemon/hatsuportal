import { CommentReadModelDTO } from './CommentReadModelDTO'

/**
 * This DTO represents a chunk of comments as returned by the read repository.
 * It cannot contain any cross Bounded Context data, but does have reference links to other entities
 * in different Bounded Contexts.
 */
export interface CommentListChunkReadModelDTO {
  comments: CommentReadModelDTO[]
  nextCursor: string | null // present when there’s more comments to load
}
