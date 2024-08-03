import { RepliesPreviewDTO } from './RepliesPreviewDTO'

/**
 * This DTO represents a comment with its direct replies.
 * It can be either a top-level comment to a post or a reply to a comment.
 * It's counterpart is the CommentListItemResponse, this DTO is used within the application layer,
 * while the CommentListItemResponse is used within the presentation layer as the contract for the API.
 */
export interface CommentWithRelationsDTO {
  id: string
  postId: string
  authorId: string
  authorName: string // from users (via join/view)
  body: string | null // null if isDeleted=true
  parentCommentId: string | null
  isDeleted: boolean
  createdAt: number
  updatedAt: number

  replyCount: number // total amount of replies, i.e. number of direct children
  hasReplies: boolean // convenience: replyCount > 0

  repliesPreview?: RepliesPreviewDTO // a subset of 1..n direct replies, cursor is used to load more
  nextCursor: string | null // present when there’s more comments to load
}
