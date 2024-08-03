import { IRepository } from '@hatsuportal/foundation'
import { PostId } from '../../domain'
import { PostDTO } from '../dtos'

export interface IPostReadRepository extends IRepository {
  findById(id: PostId): Promise<PostDTO | null>
}
