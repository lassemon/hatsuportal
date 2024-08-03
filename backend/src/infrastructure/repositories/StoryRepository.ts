import { Story, PostId, UserId } from '@hatsuportal/domain'
import { isEnumValue, StorySortableKeyEnum, Logger, OrderEnum, VisibilityEnum } from '@hatsuportal/common'
import { Knex } from 'knex'
import { connection } from '/infrastructure'
import { IStoryInfrastructureMapper, StoryDatabaseSchema } from '@hatsuportal/infrastructure'
import { DataPersistenceError, IStoryRepository, NotFoundError, StorySearchCriteria } from '@hatsuportal/application'

const logger = new Logger('StoryRepository')

export class StoryRepository implements IStoryRepository {
  constructor(private readonly storyMapper: IStoryInfrastructureMapper) {}

  async findAllPublic(orderBy: StorySortableKeyEnum, order: OrderEnum): Promise<Story[]> {
    return (
      await connection
        .join('users', 'stories.createdBy', '=', 'users.id')
        .select('stories.*', 'users.name as createdByUserName')
        .from<StoryDatabaseSchema>('stories')
        .whereIn('visibility', [VisibilityEnum.Public])
        .modify<any, StoryDatabaseSchema[]>(withOrderBy(orderBy, order))
    ).map((story) => {
      return this.storyMapper.toDomainEntity(story)
    })
  }

  async findLatest(limit: number, loggedIn: boolean): Promise<Story[]> {
    return (
      await connection
        .join('users', 'stories.createdBy', '=', 'users.id')
        .select('stories.*', 'users.name as createdByUserName')
        .from<any, StoryDatabaseSchema[]>('stories')
        .whereIn('visibility', [...(loggedIn ? [VisibilityEnum.LoggedIn] : []), VisibilityEnum.Public])
        .modify<any, StoryDatabaseSchema[]>(withOrderBy(StorySortableKeyEnum.CREATED_AT, OrderEnum.Descending))
        .limit(limit || 5)
    ).map((story) => {
      return this.storyMapper.toDomainEntity(story)
    })
  }

  async countAll(userId?: string): Promise<number> {
    const result = await connection('stories')
      .whereNotIn('visibility', userId ? [VisibilityEnum.Private] : [VisibilityEnum.Private, VisibilityEnum.LoggedIn])
      .count<{ count: number }>('id as count') // Count the number of story ids
      .first() // Use .first() to get the first row of the result
    return result ? result.count : 0
  }

  async count(query: StorySearchCriteria): Promise<number> {
    const result = await connection('stories')
      .modify<any, StoryDatabaseSchema[]>(withAccess(query.loggedInUserId, query.visibility, query.onlyMyStories))
      .modify<any, StoryDatabaseSchema[]>(withHasImage(query.hasImage))
      .modify<any, StoryDatabaseSchema[]>(withWordSearch(query.search))
      .count<{ count: number }>('id as count')
      .first()
    return result ? result.count : 0
  }

  async search(query: StorySearchCriteria): Promise<Story[]> {
    return (
      await connection
        .join('users', 'stories.createdBy', '=', 'users.id')
        .select('stories.*', 'users.name as createdByUserName')
        .from('stories')
        .modify<any, StoryDatabaseSchema[]>(withAccess(query.loggedInUserId, query.visibility, query.onlyMyStories))
        .modify<any, StoryDatabaseSchema[]>(withHasImage(query.hasImage))
        .modify<any, StoryDatabaseSchema[]>(withWordSearch(query.search))
        .modify<any, StoryDatabaseSchema[]>(withOrderBy(query.orderBy, query.order))
    ).map((story) => {
      return this.storyMapper.toDomainEntity(story)
    })
  }

  async findByImageId(imageId: PostId): Promise<Story[]> {
    return (
      await connection
        .join('users', 'stories.createdBy', '=', 'users.id')
        .select('stories.*', 'users.name as createdByUserName')
        .from<any, StoryDatabaseSchema[]>('stories')
        .where({ imageId: imageId.value })
    ).map((story) => {
      return this.storyMapper.toDomainEntity(story)
    })
  }

  async findAllVisibleForLoggedInUser(userId: UserId, orderBy: StorySortableKeyEnum, order: OrderEnum): Promise<Story[]> {
    return (
      await connection
        .join('users', 'stories.createdBy', '=', 'users.id')
        .select('stories.*', 'users.name as createdByUserName')
        .from<any, StoryDatabaseSchema[]>('stories')
        .whereIn('visibility', [VisibilityEnum.Public, VisibilityEnum.LoggedIn])
        .orWhere('stories.createdBy', userId.value)
        .modify<any, StoryDatabaseSchema[]>(withOrderBy(orderBy, order))
    ).map((story) => {
      return this.storyMapper.toDomainEntity(story)
    })
  }

  async findAllForUser(userId: UserId): Promise<Story[]> {
    return (
      await connection
        .join('users', 'stories.createdBy', '=', 'users.id')
        .select('stories.*', 'users.name as createdByUserName')
        .from<any, StoryDatabaseSchema[]>('stories')
        .where('stories.createdBy', userId.value)
        .modify<any, StoryDatabaseSchema[]>(withOrderBy(StorySortableKeyEnum.NAME, OrderEnum.Ascending))
    ).map((story) => {
      return this.storyMapper.toDomainEntity(story)
    })
  }

  async findUserStoriesByName(storyName: string, userId: UserId): Promise<Story[]> {
    return (
      await connection
        .join('users', 'stories.createdBy', '=', 'users.id')
        .select('stories.*', 'users.name as createdByUserName')
        .from<any, StoryDatabaseSchema[]>('stories')
        .where({ createdBy: userId.value })
        .whereLike('stories.name', `${storyName}%`)
        .modify<any, StoryDatabaseSchema[]>(withOrderBy(StorySortableKeyEnum.NAME, OrderEnum.Ascending))
    ).map((story) => {
      return this.storyMapper.toDomainEntity(story)
    })
  }

  async countStoriesCreatedByUser(userId: UserId): Promise<number> {
    const result = await connection('stories')
      .count<{ count: number }>('id as count') // Count the number of story ids
      .where('createdBy', userId.value) // Apply the condition
      .first() // Use .first() to get the first row of the result
    return result ? result.count : 0
  }

  async findById(storyId: PostId): Promise<Story | null> {
    const story = await connection
      .join('users', 'stories.createdBy', '=', 'users.id')
      .select('stories.*', 'users.name as createdByUserName')
      .from<any, StoryDatabaseSchema>('stories')
      .where('stories.id', storyId.value)
      .first()
    if (!story) {
      return null
    }

    return this.storyMapper.toDomainEntity(story)
  }

  async insert(story: Story) {
    const storyToInsert = this.storyMapper.toInsertQuery(story)
    try {
      await connection<any, StoryDatabaseSchema>('stories').insert(storyToInsert) // mariadb does not return inserted object
    } catch (error: any) {
      if (error instanceof Error) {
        logger.error((error as any)?.message)
        throw new DataPersistenceError(error.stack)
      } else {
        logger.error(error)
        throw new DataPersistenceError(`UnknownError`)
      }
    }
    const insertedStory = await this.findByIdRAW(storyToInsert.id)
    if (!insertedStory) {
      throw new NotFoundError('Story creation failed because just inserted story could not be found from the database.')
    }
    return this.storyMapper.toDomainEntity(insertedStory)
  }

  async update(story: Story) {
    const storyToUpdate = this.storyMapper.toUpdateQuery(story)

    try {
      await connection<any, StoryDatabaseSchema>('stories').where('id', storyToUpdate.id).update(storyToUpdate) // mariadb does not return inserted object
    } catch (error: any) {
      if (error instanceof Error) {
        logger.error((error as any)?.message)
        throw new DataPersistenceError(error.stack)
      } else {
        logger.error(error)
        throw new DataPersistenceError(`UnknownError`)
      }
    }

    const updatedStory = await this.findByIdRAW(storyToUpdate.id)
    if (!updatedStory) {
      throw new NotFoundError('Story update failed because just updated story could not be found from the database.')
    }
    return this.storyMapper.toDomainEntity(updatedStory)
  }

  async delete(storyId: PostId) {
    try {
      await connection<any, StoryDatabaseSchema>('stories').where('id', storyId.value).delete()
    } catch (error: any) {
      if (error instanceof Error) {
        logger.error((error as any)?.message)
        throw new DataPersistenceError(error.stack)
      } else {
        logger.error(error)
        throw new DataPersistenceError(`UnknownError`)
      }
    }
  }

  // RAW in this case means without converting the stringified json data into json
  private async findByIdRAW(storyId: string): Promise<StoryDatabaseSchema | null> {
    const story = await connection
      .join('users', 'stories.createdBy', '=', 'users.id')
      .select('stories.*', 'users.name as createdByUserName')
      .from<StoryDatabaseSchema, StoryDatabaseSchema>('stories')
      .where('stories.id', storyId)
      .first()
    if (!story) {
      return null
    }

    return story
  }
}

const withAccess =
  (userId?: UserId, visibility?: VisibilityEnum[], onlyMyStories: boolean = false) =>
  (queryBuilder: Knex.QueryBuilder) => {
    const visibilityFilterIsSet = visibility?.length && visibility?.length > 0
    // double equals (==) to cover for both null and undefined
    if (userId?.value == null) {
      queryBuilder.where({ 'stories.visibility': 'public' }) // only public stories
    } else {
      if (onlyMyStories === true) {
        queryBuilder.where({ 'stories.createdBy': userId.value }) // only stories created by the user
        if (visibilityFilterIsSet) {
          queryBuilder.whereIn('stories.visibility', visibility)
        }
      } else {
        if (visibilityFilterIsSet) {
          queryBuilder.whereIn('stories.visibility', visibility).andWhere((queryBuilder: Knex.QueryBuilder) => {
            queryBuilder.where({ 'stories.createdBy': userId.value }).orWhereNot({ 'stories.visibility': 'private' })
          })
        } else {
          // all users own stories and all other stories except private stories of other users
          queryBuilder.andWhere((_queryBuilder) => {
            _queryBuilder.where({ 'stories.createdBy': userId.value }).orWhereNot({ 'stories.visibility': 'private' })
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
        queryBuilder.orderBy(`createdByUserName`, _order)
        break
      case StorySortableKeyEnum.NAME:
      case StorySortableKeyEnum.VISIBILITY:
        queryBuilder.orderBy(`stories.${_orderBy}`, _order)
        break
      default:
        queryBuilder.orderBy(`stories.${_orderBy}`, _order)
        break
    }
  }
}

const withHasImage = (hasImage?: boolean | null) => (queryBuilder: Knex.QueryBuilder) => {
  if (hasImage === true || hasImage === false) {
    hasImage ? queryBuilder.whereNot('stories.imageId', null) : queryBuilder.where('stories.imageId', null)
  }
}

const withWordSearch = (wordSearch?: string) => (queryBuilder: Knex.QueryBuilder) => {
  if (wordSearch) {
    queryBuilder.andWhere(function (_queryBuilder) {
      _queryBuilder.whereILike('stories.name', `%${wordSearch}%`)
      _queryBuilder.orWhereILike('stories.description', `%${wordSearch}%`)
    })
  }
}
