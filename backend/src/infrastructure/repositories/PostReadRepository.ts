import { IPostInfrastructureMapper, IPostReadRepository, PostDTO, PostId } from '@hatsuportal/post-management'
import { Repository } from './Repository'
import { ITransactionAware } from '@hatsuportal/platform'

export class PostReadRepository extends Repository implements IPostReadRepository, ITransactionAware {
  constructor(private readonly postMapper: IPostInfrastructureMapper) {
    super('posts')
  }

  async findById(id: PostId): Promise<PostDTO | null> {
    const database = await this.databaseOrTransaction()
    const post = await database(this.tableName).where({ id }).first()
    return post ? this.postMapper.toDTO(post) : null
  }
}
