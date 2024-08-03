import { UnixTimestamp } from '@hatsuportal/shared-kernel'
import { PostDatabaseSchema } from '../schemas/PostDatabaseSchema'
import { PartialExceptFor } from '@hatsuportal/common'

/**
 * This file belongs to the Frameworks & Drivers layer of CA
 * reasoning:
 * This is a pure persistence/database type, it does not express domain types or application intent.
 * Since it does not express application concerns, in pure CA terms it does not belong to the Interface Adapters layer, since
 * that layer epxress application concerns or adapters that implement application concerns, thus it belongs to the Frameworks & Drivers layer.
 * So we place it under infrastructure.
 */

export interface IPostWriteRepository {
  findByIdForUpdate(id: string): Promise<PostDatabaseSchema | null>
  insert(post: PostDatabaseSchema): Promise<PostDatabaseSchema>
  update(post: PartialExceptFor<PostDatabaseSchema, 'id'>, baseline: UnixTimestamp): Promise<number>
  deleteById(id: string, baseline: UnixTimestamp): Promise<number>
}
