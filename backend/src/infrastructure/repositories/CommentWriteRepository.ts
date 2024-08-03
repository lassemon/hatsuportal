import {
  Comment,
  CommentDatabaseSchema,
  CommentId,
  ICommentInfrastructureMapper,
  ICommentWriteRepository
} from '@hatsuportal/post-management'
import { Repository } from './Repository'
import { UnixTimestamp } from '@hatsuportal/shared-kernel'
import { NotFoundError, unixtimeNow } from '@hatsuportal/foundation'

export class CommentWriteRepository extends Repository implements ICommentWriteRepository {
  constructor(private readonly commentMapper: ICommentInfrastructureMapper) {
    super('comments')
  }

  async findByIdForUpdate(id: CommentId): Promise<Comment | null> {
    const comment = await this.findByIdRAW(id.value)
    if (!comment) {
      return null
    }

    this.lastLoadedMap.set(comment.id, new UnixTimestamp(comment.updatedAt || unixtimeNow()))

    return this.toDomainEntity(comment)
  }

  async insert(comment: Comment): Promise<Comment> {
    const database = await this.databaseOrTransaction()
    const commentToInsert = this.commentMapper.toCommentInsertRecord(comment)
    await database(this.tableName).insert(commentToInsert)
    const reloaded = await this.findByIdRAW(comment.id.value)
    if (!reloaded) {
      throw new NotFoundError(
        `Comment creation failed because just inserted comment '${comment.id.value}' could not be found from the database.`
      )
    }
    return this.toDomainEntity(reloaded)
  }

  async update(comment: Comment): Promise<Comment> {
    const database = await this.databaseOrTransaction()
    const commentToUpdate = this.commentMapper.toCommentUpdateRecord(comment)
    await database(this.tableName).where('id', '=', comment.id.value).update(commentToUpdate)
    const reloaded = await this.findByIdRAW(comment.id.value)
    if (!reloaded) {
      throw new NotFoundError(
        `Comment update failed because just updated comment '${comment.id.value}' could not be found from the database.`
      )
    }
    return this.toDomainEntity(reloaded)
  }

  async softDelete(id: CommentId): Promise<void> {
    const database = await this.databaseOrTransaction()
    await database(this.tableName).where('id', '=', id.value).update({ isDeleted: true })
  }

  async deletePermanently(id: CommentId): Promise<void> {
    const database = await this.databaseOrTransaction()
    await database(this.tableName).where('id', '=', id.value).delete()
  }

  // NEVER TO BE USED OUTSIDE OF THIS REPOSITORY
  // RAW in this case means without mapping to domain entities
  // but still including linking ids (authorId, postId)
  private async findByIdRAW(id: string): Promise<CommentDatabaseSchema | null> {
    const database = await this.databaseOrTransaction()
    const comment = await database(this.tableName).where('id', '=', id).first()
    return comment
  }

  private toDomainEntity(comment: CommentDatabaseSchema): Comment {
    return this.commentMapper.toDomainEntity(comment)
  }
}
