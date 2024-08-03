import { CommentResponse } from './CommentResponse'

export interface GetCommentsResponse {
  comments: CommentResponse[]
  nextCursor: string | null // present when there’s more comments to load
}
