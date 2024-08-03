export interface GetRepliesInputDTO {
  parentCommentId: string
  limit: number
  cursor?: string
}
