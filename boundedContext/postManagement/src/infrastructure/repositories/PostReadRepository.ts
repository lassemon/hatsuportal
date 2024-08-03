import { RepositoryBase, ITransactionAware, IDataAccessProvider, IRepositoryHelpers } from '@hatsuportal/platform'
import { PostId } from '../../domain'
import { IPostReadRepository, PostDTO } from '../../application'
import { IPostInfrastructureMapper } from '../mappers/PostInfrastructureMapper'
import { PostDatabaseSchema } from '../schemas/PostDatabaseSchema'

export class PostReadRepository extends RepositoryBase implements IPostReadRepository, ITransactionAware {
  constructor(
    dataAccessProvider: IDataAccessProvider,
    helpers: IRepositoryHelpers,
    private readonly postMapper: IPostInfrastructureMapper
  ) {
    super(dataAccessProvider, helpers, 'posts')
  }

  async findById(id: PostId): Promise<PostDTO | null> {
    const post = await this.table<PostDatabaseSchema>().where({ id }).first()
    return post ? this.postMapper.toDTO(post) : null
  }
}
