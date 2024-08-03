import { PostId } from '../../domain'
import { PostDTO, PostSearchCriteriaDTO } from '../dtos'

export interface IPostReadRepository {
  findById(id: PostId): Promise<PostDTO | null>
  search(criteria: PostSearchCriteriaDTO): Promise<{ posts: PostDTO[]; totalCount: number }>
}
