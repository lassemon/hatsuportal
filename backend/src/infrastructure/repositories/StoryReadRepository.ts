import {
  PostId,
  IStoryReadRepository,
  StorySearchCriteriaDTO,
  IStoryInfrastructureMapper,
  PostCreatorId,
  StoryReadDatabaseSchema,
  StoryReadModelDTO
} from '@hatsuportal/post-management'
import { Knex } from 'knex'
import { Repository } from './Repository'
import { isEnumValue, Logger, OrderEnum, StorySortableKeyEnum, VisibilityEnum } from '@hatsuportal/foundation'

const logger = new Logger('StoryReadRepository')

export class StoryReadRepository extends Repository implements IStoryReadRepository {
  constructor(private readonly storyMapper: IStoryInfrastructureMapper) {
    super('story_enriched_read_view')
  }

  async findAllPublic(orderBy: StorySortableKeyEnum, order: OrderEnum): Promise<StoryReadModelDTO[]> {
    logger.debug(`Finding all public stories from table ${this.tableName}`)
    const database = await this.databaseOrTransaction()
    const stories = await database(this.tableName)
      .select(`*`)
      .from<StoryReadDatabaseSchema>(this.tableName)
      .whereIn('visibility', [VisibilityEnum.Public])
      .modify<any, StoryReadDatabaseSchema[]>(withOrderBy(orderBy, order))

    return stories.map(this.storyMapper.toDTO)
  }

  async findLatest(limit: number, loggedIn: boolean): Promise<StoryReadModelDTO[]> {
    const database = await this.databaseOrTransaction()
    const stories = await database(this.tableName)
      .select(`*`)
      .from<any, StoryReadDatabaseSchema[]>(this.tableName)
      .whereIn('visibility', [...(loggedIn ? [VisibilityEnum.LoggedIn] : []), VisibilityEnum.Public])
      .modify<any, StoryReadDatabaseSchema[]>(withOrderBy(StorySortableKeyEnum.CREATED_AT, OrderEnum.Descending))
      .limit(limit || 5)

    return stories.map(this.storyMapper.toDTO)
  }

  async count(query: StorySearchCriteriaDTO): Promise<number> {
    const database = await this.databaseOrTransaction()
    const result = await database(this.tableName)
      .modify<any, StoryReadDatabaseSchema[]>(withAccess(query.loggedInCreatorId, query.visibility, query.onlyMyStories))
      .modify<any, StoryReadDatabaseSchema[]>(withHasImage(query.hasImage))
      .modify<any, StoryReadDatabaseSchema[]>(withWordSearch(query.search))
      .count<{ count: number }>('id as count')
      .first()
    return result ? result.count : 0
  }

  async search(query: StorySearchCriteriaDTO): Promise<StoryReadModelDTO[]> {
    const database = await this.databaseOrTransaction()
    const stories = await database(this.tableName)
      .select(`*`)
      .from(this.tableName)
      .modify<any, StoryReadDatabaseSchema[]>(withAccess(query.loggedInCreatorId, query.visibility, query.onlyMyStories))
      .modify<any, StoryReadDatabaseSchema[]>(withHasImage(query.hasImage))
      .modify<any, StoryReadDatabaseSchema[]>(withWordSearch(query.search))
      .modify<any, StoryReadDatabaseSchema[]>(withOrderBy(query.orderBy, query.order))

    return stories.map(this.storyMapper.toDTO)
  }

  async findByImageId(imageId: PostId): Promise<StoryReadModelDTO[]> {
    const database = await this.databaseOrTransaction()
    const stories = await database(this.tableName)
      .select(`*`)
      .from<any, StoryReadDatabaseSchema[]>(this.tableName)
      .where({ imageId: imageId.value })

    return stories.map(this.storyMapper.toDTO)
  }

  async findAllVisibleForLoggedInCreator(
    creatorId: PostCreatorId,
    orderBy: StorySortableKeyEnum,
    order: OrderEnum
  ): Promise<StoryReadModelDTO[]> {
    const database = await this.databaseOrTransaction()
    const stories = await database(this.tableName)
      .select(`*`)
      .from<any, StoryReadDatabaseSchema[]>(this.tableName)
      .whereIn('visibility', [VisibilityEnum.Public, VisibilityEnum.LoggedIn])
      .orWhere('createdById', creatorId.value)
      .modify<any, StoryReadDatabaseSchema[]>(withOrderBy(orderBy, order))

    return stories.map(this.storyMapper.toDTO)
  }

  async findAllForCreator(creatorId: PostCreatorId): Promise<StoryReadModelDTO[]> {
    const database = await this.databaseOrTransaction()
    const stories = await database(this.tableName)
      .select(`*`)
      .from<any, StoryReadDatabaseSchema[]>(this.tableName)
      .where('createdById', creatorId.value)
      .modify<any, StoryReadDatabaseSchema[]>(withOrderBy(StorySortableKeyEnum.NAME, OrderEnum.Ascending))

    return stories.map(this.storyMapper.toDTO)
  }

  async findStoriesOfCreatorByName(storyName: string, creatorId: PostCreatorId): Promise<StoryReadModelDTO[]> {
    const database = await this.databaseOrTransaction()
    const stories = await database(this.tableName)
      .select(`*`)
      .from<any, StoryReadDatabaseSchema[]>(this.tableName)
      .where({ createdById: creatorId.value })
      .whereLike('name', `${storyName}%`)
      .modify<any, StoryReadDatabaseSchema[]>(withOrderBy(StorySortableKeyEnum.NAME, OrderEnum.Ascending))

    return stories.map(this.storyMapper.toDTO)
  }

  async countStoriesByCreator(creatorId: PostCreatorId): Promise<number> {
    const database = await this.databaseOrTransaction()
    const result = await database(this.tableName)
      .count<{ count: number }>('id as count') // Count the number of story ids
      .where('createdById', creatorId.value) // Apply the condition
      .first() // Use .first() to get the first row of the result
    return result ? result.count : 0
  }

  async findById(storyId: PostId): Promise<StoryReadModelDTO | null> {
    const database = await this.databaseOrTransaction()
    const story = await database(this.tableName)
      .select(`*`)
      .from<any, StoryReadDatabaseSchema>(this.tableName)
      .where('id', storyId.value)
      .first()
    if (!story) {
      return null
    }

    return this.storyMapper.toDTO(story)
  }
}

const withAccess =
  (creatorId?: PostCreatorId, visibility?: VisibilityEnum[], onlyMyStories: boolean = false) =>
  (queryBuilder: Knex.QueryBuilder) => {
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
          queryBuilder.whereIn('visibility', visibility).andWhere((queryBuilder: Knex.QueryBuilder) => {
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

const withOrderBy = (orderBy: StorySortableKeyEnum, order: OrderEnum) => (queryBuilder: Knex.QueryBuilder) => {
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

const withHasImage = (hasImage?: boolean | null) => (queryBuilder: Knex.QueryBuilder) => {
  if (hasImage === true || hasImage === false) {
    hasImage ? queryBuilder.whereNot('coverImageId', null) : queryBuilder.where('coverImageId', null)
  }
}

const withWordSearch = (wordSearch?: string) => (queryBuilder: Knex.QueryBuilder) => {
  if (wordSearch) {
    queryBuilder.andWhere(function (_queryBuilder) {
      _queryBuilder.whereILike('name', `%${wordSearch}%`)
      _queryBuilder.orWhereILike('description', `%${wordSearch}%`)
    })
  }
}
