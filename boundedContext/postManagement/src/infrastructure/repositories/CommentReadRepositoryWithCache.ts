import { ICache, ITransaction, ITransactionAware } from '@hatsuportal/platform'
import { CommentListChunkReadModelDTO, CommentReadModelDTO, ICommentReadRepository, ReplyListChunkReadModelDTO } from '../../application'
import { CommentCursor, CommentId, PostId } from '../../domain'
import { NonNegativeInteger } from '@hatsuportal/shared-kernel'
import { OrderEnum } from '@hatsuportal/common'

export class CommentReadRepositoryWithCache implements ICommentReadRepository, ITransactionAware {
  constructor(
    private readonly baseRepo: ICommentReadRepository & ITransactionAware,
    private readonly cache: ICache<CommentReadModelDTO>
  ) {}

  async getById(id: CommentId): Promise<CommentReadModelDTO> {
    const key = `getById:${id.value}`
    if (!this.cache.has(key)) {
      const comment = await this.baseRepo.getById(id)
      this.cache.set(key, comment)
    }
    return this.cache.get(key)!
  }

  async listTopLevelForPost(
    postId: PostId,
    options: {
      limit: NonNegativeInteger
      sort: OrderEnum
      cursor?: CommentCursor
      replyPreviewOptions: { perParentLimit: NonNegativeInteger }
    }
  ): Promise<CommentListChunkReadModelDTO> {
    return await this.baseRepo.listTopLevelForPost(postId, options)
  }

  async listReplies(
    parentCommentId: CommentId,
    options: { limit: NonNegativeInteger; sort: OrderEnum; cursor?: CommentCursor }
  ): Promise<ReplyListChunkReadModelDTO> {
    return await this.baseRepo.listReplies(parentCommentId, options)
  }

  async countForPost(postId: PostId): Promise<number> {
    return await this.baseRepo.countForPost(postId)
  }

  async countReplies(parentCommentId: CommentId): Promise<number> {
    return await this.baseRepo.countReplies(parentCommentId)
  }

  getTableName(): string {
    return this.baseRepo.getTableName()
  }

  setTransaction(transaction: ITransaction): void {
    this.baseRepo.setTransaction(transaction)
  }

  clearLastLoadedMap(): void {
    this.baseRepo.clearLastLoadedMap()
  }
}
