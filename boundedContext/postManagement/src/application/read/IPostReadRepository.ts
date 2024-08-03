import { PostId } from '../../domain'
import { PostDTO } from '../dtos'

export interface IPostReadRepository {
  findById(id: PostId): Promise<PostDTO | null>
}
