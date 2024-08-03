import { CommentWithRelationsDTO } from './CommentWithRelationsDTO'

export interface CommentListChunkDTO {
  comments: CommentWithRelationsDTO[]
  nextCursor: string | null
}
