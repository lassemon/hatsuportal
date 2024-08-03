export interface CommentDatabaseSchema {
  id: string
  postId: string
  authorId: string
  body: string
  parentCommentId: string | null
  isDeleted: boolean
  replyCount: number
  hasReplies: boolean
  createdAt: number
  updatedAt: number
}
