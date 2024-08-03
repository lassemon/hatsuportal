import { RepositoryBase, ITransactionAware, IDataAccessProvider, IRepositoryHelpers } from '@hatsuportal/platform'
import { PostDatabaseSchema } from '../schemas/PostDatabaseSchema'
import { UnixTimestamp } from '@hatsuportal/shared-kernel'
import { PartialExceptFor } from '@hatsuportal/common'
import { IPostWriteRepository } from './IPostWriteRepository'

export class PostWriteRepository extends RepositoryBase implements IPostWriteRepository, ITransactionAware {
  constructor(dataAccessProvider: IDataAccessProvider, helpers: IRepositoryHelpers) {
    super(dataAccessProvider, helpers, 'posts')
  }

  async findByIdForUpdate(id: string): Promise<PostDatabaseSchema | null> {
    return await this.table<PostDatabaseSchema>().where({ id }).first()
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
