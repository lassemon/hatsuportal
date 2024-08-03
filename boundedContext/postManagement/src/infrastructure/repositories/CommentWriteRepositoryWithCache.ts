import { ITransactionAware, ITransaction } from '@hatsuportal/platform'
import { Comment, CommentId, ICommentWriteRepository } from '../../domain'

export class CommentWriteRepositoryWithCache implements ICommentWriteRepository, ITransactionAware {
  constructor(
    private readonly baseRepo: ICommentWriteRepository & ITransactionAware,
    private readonly cache: Map<string, Comment | null>
  ) {}

  async findByIdForUpdate(id: CommentId): Promise<Comment | null> {
    const key = `findByIdForUpdate:${id.value}`
    if (!this.cache.has(key)) {
      const comment = await this.baseRepo.findByIdForUpdate(id)
      this.cache.set(key, comment)
    }

    return this.cache.get(key) || null
  }

  async insert(comment: Comment): Promise<Comment> {
    return await this.baseRepo.insert(comment)
  }

  async update(comment: Comment): Promise<Comment> {
    return await this.baseRepo.update(comment)
  }

  async softDelete(id: CommentId): Promise<void> {
    await this.baseRepo.softDelete(id)
  }

  async deletePermanently(id: CommentId): Promise<void> {
    await this.baseRepo.deletePermanently(id)
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
