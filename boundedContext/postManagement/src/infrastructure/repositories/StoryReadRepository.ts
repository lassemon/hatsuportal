import { StorySortableKeyEnum, OrderEnum, VisibilityEnum, isEnumValue } from '@hatsuportal/common'
import { RepositoryBase, ITransactionAware, IDataAccessProvider, IRepositoryHelpers, IQueryBuilder } from '@hatsuportal/platform'
import { PostId, PostCreatorId } from '../../domain'
import { IStoryReadRepository, StoryReadModelDTO, StorySearchCriteriaDTO } from '../../application'
import { IStoryInfrastructureMapper } from '../mappers/StoryInfrastructureMapper'
import { StoryReadDatabaseSchema } from '../schemas/StoryReadDatabaseSchema'

export class StoryReadRepository extends RepositoryBase implements IStoryReadRepository, ITransactionAware {
  constructor(
    dataAccessProvider: IDataAccessProvider,
    helpers: IRepositoryHelpers,
    private readonly storyMapper: IStoryInfrastructureMapper
  ) {
    super(dataAccessProvider, helpers, 'story_enriched_read_view')
  }

  async findAllPublic(orderBy: StorySortableKeyEnum, order: OrderEnum): Promise<StoryReadModelDTO[]> {
    const stories = await this.table<StoryReadDatabaseSchema>()
      .select(`*`)
      .whereIn('visibility', [VisibilityEnum.Public])
      .modify(withOrderBy(orderBy, order))

    return stories.map(this.storyMapper.toDTO)
  }

  async findLatest(limit: number, loggedIn: boolean): Promise<StoryReadModelDTO[]> {
    const stories = await this.table<StoryReadDatabaseSchema>()
      .select(`*`)
      .whereIn('visibility', [...(loggedIn ? [VisibilityEnum.LoggedIn] : []), VisibilityEnum.Public])
      .modify(withOrderBy(StorySortableKeyEnum.CREATED_AT, OrderEnum.Descending))
      .limit(limit || 5)

    return stories.map(this.storyMapper.toDTO)
  }

  async count(query: StorySearchCriteriaDTO): Promise<number> {
    const result = await this.table<StoryReadDatabaseSchema>()
      .modify(withAccess(query.loggedInCreatorId, query.visibility, query.onlyMyStories))
      .modify(withHasImage(query.hasImage))
      .modify(withWordSearch(query.search))
      .count('id as count')
      .first()
    return result ? result.count : 0
  }

  async search(query: StorySearchCriteriaDTO): Promise<StoryReadModelDTO[]> {
    const stories = await this.table<StoryReadDatabaseSchema>()
      .select(`*`)
      .modify(withAccess(query.loggedInCreatorId, query.visibility, query.onlyMyStories))
      .modify(withHasImage(query.hasImage))
      .modify(withWordSearch(query.search))
      .modify(withOrderBy(query.orderBy, query.order))

    return stories.map(this.storyMapper.toDTO)
  }

  async findByImageId(imageId: PostId): Promise<StoryReadModelDTO[]> {
    const stories = await this.table<StoryReadDatabaseSchema>().select(`*`).where({ imageId: imageId.value })

    return stories.map(this.storyMapper.toDTO)
  }

  async findAllVisibleForLoggedInCreator(
    creatorId: PostCreatorId,
    orderBy: StorySortableKeyEnum,
    order: OrderEnum
  ): Promise<StoryReadModelDTO[]> {
    const stories = await this.table<StoryReadDatabaseSchema>()
      .select(`*`)
      .whereIn('visibility', [VisibilityEnum.Public, VisibilityEnum.LoggedIn])
      .orWhere('createdById', creatorId.value)
      .modify(withOrderBy(orderBy, order))

    return stories.map(this.storyMapper.toDTO)
  }

  async findAllForCreator(creatorId: PostCreatorId): Promise<StoryReadModelDTO[]> {
    const stories = await this.table<StoryReadDatabaseSchema>()
      .select(`*`)
      .where('createdById', creatorId.value)
      .modify(withOrderBy(StorySortableKeyEnum.NAME, OrderEnum.Ascending))

    return stories.map(this.storyMapper.toDTO)
  }

  async findStoriesOfCreatorByName(storyName: string, creatorId: PostCreatorId): Promise<StoryReadModelDTO[]> {
    const stories = await this.table<StoryReadDatabaseSchema>()
      .select(`*`)
      .where({ createdById: creatorId.value })
      .whereLike('name', `${storyName}%`)
      .modify(withOrderBy(StorySortableKeyEnum.NAME, OrderEnum.Ascending))

    return stories.map(this.storyMapper.toDTO)
  }

  async countStoriesByCreator(creatorId: PostCreatorId): Promise<number> {
    const result = await this.table<StoryReadDatabaseSchema>()
      .count('id as count') // Count the number of story ids
      .where('createdById', creatorId.value) // Apply the condition
      .first() // Use .first() to get the first row of the result
    return result ? result.count : 0
  }

  async findById(storyId: PostId): Promise<StoryReadModelDTO | null> {
    const story = await this.table<StoryReadDatabaseSchema>().select(`*`).where('id', storyId.value).first()

    if (!story) {
      return null
    }

    return this.storyMapper.toDTO(story)
  }
}

const withAccess =
  (creatorId?: PostCreatorId, visibility?: VisibilityEnum[], onlyMyStories: boolean = false) =>
  (queryBuilder: IQueryBuilder<StoryReadDatabaseSchema>) => {
    const visibilityFilterIsSet = visibility?.length && visibility?.length > 0
    // double equals (==) to cover for both null and undefined
    if (creatorId?.value == null) {
      queryBuilder.where({ visibility: 'public' }) // only public stories
    } else {
      if (onlyMyStories === true) {
        queryBuilder.where({ createdById: creatorId.value }) // only stories created by the user
        if (visibilityFilterIsSet) {
          queryBuilder.whereIn('visibility', visibility)
        }
      } else {
        if (visibilityFilterIsSet) {
          queryBuilder.whereIn('visibility', visibility).andWhere((queryBuilder: IQueryBuilder<StoryReadDatabaseSchema>) => {
            queryBuilder.where({ createdById: creatorId.value }).orWhereNot({ visibility: 'private' })
          })
        } else {
          // all users own stories and all other stories except private stories of other users
          queryBuilder.andWhere((_queryBuilder) => {
            _queryBuilder.where({ createdById: creatorId.value }).orWhereNot({ visibility: 'private' })
          })
        }
      }
    }
  }

const withOrderBy = (orderBy: StorySortableKeyEnum, order: OrderEnum) => (queryBuilder: IQueryBuilder<StoryReadDatabaseSchema>) => {
  if (orderBy) {
    const _orderBy = isEnumValue(orderBy, StorySortableKeyEnum) ? orderBy : StorySortableKeyEnum.NAME
    const _order = order === OrderEnum.Ascending || order === OrderEnum.Descending ? order : OrderEnum.Descending
    switch (orderBy) {
      case StorySortableKeyEnum.CREATED_BY:
        queryBuilder.orderBy(`createdByName`, _order)
        break
      case StorySortableKeyEnum.NAME:
      case StorySortableKeyEnum.VISIBILITY:
        queryBuilder.orderBy(`${_orderBy}`, _order)
        break
      default:
        queryBuilder.orderBy(`${_orderBy}`, _order)
        break
    }
  }
}

const withHasImage = (hasImage?: boolean | null) => (queryBuilder: IQueryBuilder<StoryReadDatabaseSchema>) => {
  if (hasImage === true || hasImage === false) {
    hasImage ? queryBuilder.whereNot('coverImageId', null) : queryBuilder.where('coverImageId', null)
  }
}

const withWordSearch = (wordSearch?: string) => (queryBuilder: IQueryBuilder<StoryReadDatabaseSchema>) => {
  if (wordSearch) {
    queryBuilder.andWhere(function (_queryBuilder) {
      _queryBuilder.whereILike('name', `%${wordSearch}%`)
      _queryBuilder.orWhereILike('description', `%${wordSearch}%`)
    })
  }
}
