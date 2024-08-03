import { ReplyReadModelDTO } from './ReplyReadModelDTO'

export interface ReplyListChunkReadModelDTO {
  replies: ReplyReadModelDTO[]
  nextCursor: string | null // present when there’s more replies to load
}
