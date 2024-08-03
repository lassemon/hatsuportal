import { OrderEnum } from '@hatsuportal/common'
import { PostId } from '../../domain'
import { CommentCursor } from '../../domain/valueObjects/CommentCursor'
import { CommentId } from '../../domain/valueObjects/CommentId'
import { ReplyListChunkReadModelDTO, CommentReadModelDTO, CommentListChunkReadModelDTO } from '../dtos'
import { NonNegativeInteger } from '@hatsuportal/shared-kernel'

export interface ICommentReadRepository {
  getById(id: CommentId): Promise<CommentReadModelDTO>

  listTopLevelForPost(
    postId: PostId,
    options: {
      limit: NonNegativeInteger
      sort: OrderEnum
      cursor?: CommentCursor
      replyPreviewOptions: { perParentLimit: NonNegativeInteger }
    }
  ): Promise<CommentListChunkReadModelDTO>

  listReplies(
    parentCommentId: CommentId,
    options: {
      limit: NonNegativeInteger
      sort: OrderEnum
      cursor?: CommentCursor
    }
  ): Promise<ReplyListChunkReadModelDTO>

  countForPost(postId: PostId): Promise<number>
  countReplies(parentCommentId: CommentId): Promise<number>
}
