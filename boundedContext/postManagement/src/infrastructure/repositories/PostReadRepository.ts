import { isEnumValue, OrderEnum, SortableKeyEnum } from '@hatsuportal/common'
import { IDataAccessProvider, IQueryBuilder, IRepositoryHelpers, ITransactionAware, RepositoryBase } from '@hatsuportal/platform'
import { PostId } from '../../domain'
import { IPostReadRepository, PostDTO, PostSearchCriteriaDTO } from '../../application'
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

  async search(criteria: PostSearchCriteriaDTO): Promise<{ posts: PostDTO[]; totalCount: number }> {
    const baseQuery = () =>
      this.table<PostDatabaseSchema>()
        .modify(withPostTypeFilter(criteria.postType))
        .modify(withPostAccess(criteria.loggedInCreatorId?.value, criteria.visibility, criteria.isSuperAdmin, criteria.isVisibilityUserProvided))
        .modify(withFullTextSearch(criteria.search))

    const countResult = await baseQuery().count('id as count').first()
    const totalCount = countResult ? Number(countResult.count) : 0

    const rows = await baseQuery()
      .select('*')
      .modify(withPostsOrderBy(criteria.orderBy, criteria.order))
      .modify(withPagination(criteria.postsPerPage, criteria.pageNumber))

    return { posts: rows.map(this.postMapper.toDTO), totalCount }
  }
}

const withPostTypeFilter =
  (postType?: string) =>
  (qb: IQueryBuilder<PostDatabaseSchema>) => {
    if (postType) {
      qb.where({ postType })
    }
  }

/**
 * Access control for the posts master table.
 *
 *   anonymous (no loggedInCreatorId):
 *     → WHERE visibility = 'public'
 *
 *   SuperAdmin + no user-provided filter:
 *     → no restriction (all posts visible)
 *
 *   SuperAdmin + user-provided filter:
 *     → WHERE visibility IN (filter)   [strict, no ownership override]
 *
 *   regular user + server-resolved filter [public, logged_in]:
 *     → WHERE (visibility IN ('public','logged_in') OR createdById = userId)
 *       (own private posts are always included)
 *
 *   regular user + user-provided filter:
 *     → WHERE visibility IN (filter) AND (visibility != 'private' OR createdById = userId)
 *       (for 'private' filter this collapses to: own private posts only)
 */
const withPostAccess =
  (loggedInCreatorId?: string, visibility?: string[], isSuperAdmin?: boolean, isVisibilityUserProvided?: boolean) =>
  (qb: IQueryBuilder<PostDatabaseSchema>) => {
    const hasVisibilityFilter = visibility && visibility.length > 0

    if (!loggedInCreatorId) {
      qb.where({ visibility: 'public' })
    } else if (isSuperAdmin) {
      if (hasVisibilityFilter) {
        qb.whereIn('visibility', visibility)
      }
      // SuperAdmin with no filter: no restriction applied
    } else if (hasVisibilityFilter && isVisibilityUserProvided) {
      // User explicitly chose this filter — respect it strictly but enforce private ownership
      qb.whereIn('visibility', visibility).andWhere((inner) => {
        inner.whereNot('visibility', 'private').orWhere('createdById', loggedInCreatorId)
      })
    } else if (hasVisibilityFilter) {
      // Server-resolved default [public, logged_in]: also include the user's own private posts
      qb.andWhere((inner) => {
        inner.whereIn('visibility', visibility).orWhere('createdById', loggedInCreatorId)
      })
    }
  }

const withFullTextSearch =
  (search?: string) =>
  (qb: IQueryBuilder<PostDatabaseSchema>) => {
    if (search) {
      qb.andWhereRaw(`search_vector @@ plainto_tsquery('english', ?)`, [search])
    }
  }

const withPostsOrderBy =
  (orderBy?: SortableKeyEnum, order?: OrderEnum) =>
  (qb: IQueryBuilder<PostDatabaseSchema>) => {
    const safeOrderBy = orderBy && isEnumValue(orderBy, SortableKeyEnum) ? orderBy : SortableKeyEnum.CREATED_AT
    const safeOrder = order === OrderEnum.Ascending || order === OrderEnum.Descending ? order : OrderEnum.Descending
    qb.orderBy(safeOrderBy, safeOrder)
  }

const withPagination =
  (postsPerPage?: number, pageNumber?: number) =>
  (qb: IQueryBuilder<PostDatabaseSchema>) => {
    if (postsPerPage && postsPerPage > 0) {
      const page = pageNumber && pageNumber > 0 ? pageNumber : 1
      qb.limit(postsPerPage).offset((page - 1) * postsPerPage)
    }
  }
