export interface ReplyReadModelDTO {
  id: string
  authorId: string
  body: string | null
  isDeleted: boolean
  createdAt: number
}
