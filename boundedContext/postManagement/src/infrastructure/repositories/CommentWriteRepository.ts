import { unixtimeNow } from '@hatsuportal/common'
import { UnixTimestamp } from '@hatsuportal/shared-kernel'
import { RepositoryBase, ITransactionAware, IDataAccessProvider, IRepositoryHelpers, NotFoundError } from '@hatsuportal/platform'
import { ICommentInfrastructureMapper } from '../mappers/CommentInfrastructureMapper'
import { CommentId, Comment, ICommentWriteRepository } from '../../domain'
import { CommentDatabaseSchema } from '../schemas/CommentDatabaseSchema'

export class CommentWriteRepository extends RepositoryBase implements ICommentWriteRepository, ITransactionAware {
  constructor(
    dataAccessProvider: IDataAccessProvider,
    helpers: IRepositoryHelpers,
    private readonly commentMapper: ICommentInfrastructureMapper
  ) {
    super(dataAccessProvider, helpers, 'comments')
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
    const commentToInsert = this.commentMapper.toCommentInsertRecord(comment)
    await this.table<CommentDatabaseSchema>().insert(commentToInsert)
    const reloaded = await this.findByIdRAW(comment.id.value)
    if (!reloaded) {
      throw new NotFoundError(
        `Comment creation failed because just inserted comment '${comment.id.value}' could not be found from the database.`
      )
    }
    return this.toDomainEntity(reloaded)
  }

  async update(comment: Comment): Promise<Comment> {
    const commentToUpdate = this.commentMapper.toCommentUpdateRecord(comment)
    await this.table<CommentDatabaseSchema>().where('id', '=', comment.id.value).update(commentToUpdate)
    const reloaded = await this.findByIdRAW(comment.id.value)
    if (!reloaded) {
      throw new NotFoundError(
        `Comment update failed because just updated comment '${comment.id.value}' could not be found from the database.`
      )
    }
    return this.toDomainEntity(reloaded)
  }

  async softDelete(id: CommentId): Promise<void> {
    await this.table<CommentDatabaseSchema>().where('id', '=', id.value).update({ isDeleted: true })
  }

  async deletePermanently(id: CommentId): Promise<void> {
    await this.table<CommentDatabaseSchema>().where('id', '=', id.value).delete()
  }

  // NEVER TO BE USED OUTSIDE OF THIS REPOSITORY
  // RAW in this case means without mapping to domain entities
  // but still including linking ids (authorId, postId)
  private async findByIdRAW(id: string): Promise<CommentDatabaseSchema | null> {
    return await this.table<CommentDatabaseSchema>().where('id', '=', id).first()
  }

  private toDomainEntity(comment: CommentDatabaseSchema): Comment {
    return this.commentMapper.toDomainEntity(comment)
  }
}
