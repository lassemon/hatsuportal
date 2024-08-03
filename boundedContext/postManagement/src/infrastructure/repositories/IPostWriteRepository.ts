import { UnixTimestamp } from '@hatsuportal/shared-kernel'
import { PostDatabaseSchema } from '../schemas/PostDatabaseSchema'
import { PartialExceptFor } from '@hatsuportal/common'

export interface IPostWriteRepository {
  findByIdForUpdate(id: string): Promise<PostDatabaseSchema | null>
  insert(post: PostDatabaseSchema): Promise<PostDatabaseSchema>
  update(post: PartialExceptFor<PostDatabaseSchema, 'id'>, baseline: UnixTimestamp): Promise<number>
  deleteById(id: string, baseline: UnixTimestamp): Promise<number>
}
