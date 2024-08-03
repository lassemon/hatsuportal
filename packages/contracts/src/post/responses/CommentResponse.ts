import { ReplyResponse } from './ReplyResponse'

/**
 * This response represents a comment with its direct replies.
 * It can be either a top-level comment to a post or a reply to a comment.
 * It's counterpart is the CommentListItemDTO, this response is used within the presentation layer as the contract for the API,
 * while the CommentListItemDTO is used within the application layer.
 */
export interface CommentResponse {
  id: string
  postId: string
  authorId: string
  authorName: string
  body: string | null // null if isDeleted
  parentCommentId: string | null
  isDeleted: boolean
  createdAt: number
  updatedAt: number

  replyCount: number // total amount of replies, i.e. number of direct children
  hasReplies: boolean // convenience: replyCount > 0

  repliesPreview?: {
    replies: ReplyResponse[] // a subset of 1..n direct replies, cursor is used to load more
    nextCursor: string | null // present when there’s more replies to load
  }
}
