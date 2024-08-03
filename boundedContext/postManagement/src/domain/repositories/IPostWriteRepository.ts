import { UnixTimestamp } from '@hatsuportal/shared-kernel'
import { PostDatabaseSchema } from '../../infrastructure'
import { IRepository, PartialExceptFor } from '@hatsuportal/foundation'

export interface IPostWriteRepository extends IRepository {
  findByIdForUpdate(id: string): Promise<PostDatabaseSchema | null>
  insert(post: PostDatabaseSchema): Promise<PostDatabaseSchema>
  update(post: PartialExceptFor<PostDatabaseSchema, 'id'>, baseline: UnixTimestamp): Promise<number>
  deleteById(id: string, baseline: UnixTimestamp): Promise<number>
}
