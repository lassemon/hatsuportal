import { ReplyListChunkReadModelDTO } from './ReplyListChunkReadModelDTO'

export interface CommentReadModelDTO {
  id: string
  postId: string
  authorId: string
  body: string | null // null if isDeleted
  parentCommentId: string | null
  isDeleted: boolean
  createdAt: number
  updatedAt: number
  replyCount: number
  hasReplies: boolean
  repliesPreview: ReplyListChunkReadModelDTO
}
