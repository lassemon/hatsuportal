import { ReplyDTO } from './ReplyDTO'

export interface RepliesPreviewDTO {
  replies: ReplyDTO[]
  nextCursor: string | null // present when there’s more replies to load
}
