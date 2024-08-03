import { RepositoryBase, IDataAccessProvider, IRepositoryHelpers, ITransactionContext } from '@hatsuportal/platform'
import { PostDatabaseSchema } from '../schemas/PostDatabaseSchema'
import { UnixTimestamp } from '@hatsuportal/shared-kernel'
import { PartialExceptFor } from '@hatsuportal/common'
import { IPostWriteRepository } from './IPostWriteRepository'

export class PostWriteRepository extends RepositoryBase implements IPostWriteRepository {
  constructor(dataAccessProvider: IDataAccessProvider, helpers: IRepositoryHelpers, transactionContext: ITransactionContext) {
    super(dataAccessProvider, helpers, transactionContext, 'posts')
  }

  async findByIdForUpdate(id: string): Promise<PostDatabaseSchema | null> {
    return await this.table<PostDatabaseSchema>().where({ id }).forUpdate().first()
  }

  async insert(post: PostDatabaseSchema): Promise<PostDatabaseSchema> {
    const result = await this.table<PostDatabaseSchema>().insert(post)
    return result[0]
  }

  async update(post: PartialExceptFor<PostDatabaseSchema, 'id'>, baseline: UnixTimestamp): Promise<number> {
    const affected = await this.table<PostDatabaseSchema>().where({ id: post.id, updatedAt: baseline.value }).update(post)
    return affected.length
  }

  async deleteById(id: string, baseline: UnixTimestamp): Promise<number> {
    const affected = await this.table<PostDatabaseSchema>().where({ id, updatedAt: baseline.value }).delete()
    return affected.length
  }
}
