import { ReplyResponse } from './ReplyResponse'

export interface GetRepliesResponse {
  replies: ReplyResponse[]
  nextCursor: string | null
}
