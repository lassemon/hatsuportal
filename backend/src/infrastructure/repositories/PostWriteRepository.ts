import { PartialExceptFor } from '@hatsuportal/foundation'
import { Repository } from './Repository'
import { IPostWriteRepository, PostDatabaseSchema } from '@hatsuportal/post-management'
import { UnixTimestamp } from '@hatsuportal/shared-kernel'

export class PostWriteRepository extends Repository implements IPostWriteRepository {
  constructor() {
    super('posts')
  }

  async findByIdForUpdate(id: string): Promise<PostDatabaseSchema | null> {
    const database = await this.databaseOrTransaction()
    return await database(this.tableName).where({ id }).first()
  }

  async insert(post: PostDatabaseSchema): Promise<PostDatabaseSchema> {
    const database = await this.databaseOrTransaction()
    const result = await database(this.tableName).insert(post).returning('*')
    return result[0]
  }

  async update(post: PartialExceptFor<PostDatabaseSchema, 'id'>, baseline: UnixTimestamp): Promise<number> {
    const database = await this.databaseOrTransaction()
    return await database(this.tableName).where({ id: post.id, updatedAt: baseline.value }).update(post)
  }

  async deleteById(id: string, baseline: UnixTimestamp): Promise<number> {
    const database = await this.databaseOrTransaction()
    return await database(this.tableName).where({ id, updatedAt: baseline.value }).delete()
  }
}
