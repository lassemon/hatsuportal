export interface ReplyDTO {
  id: string
  authorId: string
  authorName: string
  body: string | null // null if isDeleted
  isDeleted: boolean
  createdAt: number
}
