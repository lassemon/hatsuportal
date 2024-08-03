export interface CommentDTO {
  id: string
  postId: string
  authorId: string
  body: string | null
  parentCommentId: string | null
  isDeleted: boolean
  createdAt: number
  updatedAt: number
}
