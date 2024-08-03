import {
  Story,
  PostId,
  IStoryRepository,
  StorySearchCriteriaDTO,
  IStoryInfrastructureMapper,
  StoryDatabaseSchema,
  PostCreatorId
} from '@hatsuportal/post-management'
import { isEnumValue, StorySortableKeyEnum, Logger, OrderEnum, VisibilityEnum, Maybe, unixtimeNow } from '@hatsuportal/common'
import {
  ConcurrencyError,
  DataPersistenceError,
  ForbiddenError,
  IImageRepository,
  Image,
  ImageId,
  NotFoundError,
  UnixTimestamp
} from '@hatsuportal/common-bounded-context'
import { Knex } from 'knex'
import { Repository } from './Repository'

const logger = new Logger('StoryRepository')

export class StoryRepository extends Repository implements IStoryRepository {
  constructor(private readonly imageRepository: IImageRepository, private readonly storyMapper: IStoryInfrastructureMapper) {
    super('stories')
  }

  async findAllPublic(orderBy: StorySortableKeyEnum, order: OrderEnum): Promise<Story[]> {
    const database = await this.databaseOrTransaction()
    const stories = await database(this.tableName)
      .join('users', 'stories.createdById', '=', 'users.id')
      .select('stories.*', 'users.name as createdByName')
      .from<StoryDatabaseSchema>(this.tableName)
      .whereIn('visibility', [VisibilityEnum.Public])
      .modify<any, StoryDatabaseSchema[]>(withOrderBy(orderBy, order))

    return this.loadStoriesWithResilientImages(stories)
  }

  async findLatest(limit: number, loggedIn: boolean): Promise<Story[]> {
    const database = await this.databaseOrTransaction()
    const stories = await database(this.tableName)
      .join('users', 'stories.createdById', '=', 'users.id')
      .select('stories.*', 'users.name as createdByName')
      .from<any, StoryDatabaseSchema[]>(this.tableName)
      .whereIn('visibility', [...(loggedIn ? [VisibilityEnum.LoggedIn] : []), VisibilityEnum.Public])
      .modify<any, StoryDatabaseSchema[]>(withOrderBy(StorySortableKeyEnum.CREATED_AT, OrderEnum.Descending))
      .limit(limit || 5)

    return this.loadStoriesWithResilientImages(stories)
  }

  async count(query: StorySearchCriteriaDTO): Promise<number> {
    const database = await this.databaseOrTransaction()
    const result = await database(this.tableName)
      .modify<any, StoryDatabaseSchema[]>(withAccess(query.loggedInCreatorId, query.visibility, query.onlyMyStories))
      .modify<any, StoryDatabaseSchema[]>(withHasImage(query.hasImage))
      .modify<any, StoryDatabaseSchema[]>(withWordSearch(query.search))
      .count<{ count: number }>('id as count')
      .first()
    return result ? result.count : 0
  }

  async search(query: StorySearchCriteriaDTO): Promise<Story[]> {
    const database = await this.databaseOrTransaction()
    const stories = await database(this.tableName)
      .join('users', 'stories.createdById', '=', 'users.id')
      .select('stories.*', 'users.name as createdByName')
      .from(this.tableName)
      .modify<any, StoryDatabaseSchema[]>(withAccess(query.loggedInCreatorId, query.visibility, query.onlyMyStories))
      .modify<any, StoryDatabaseSchema[]>(withHasImage(query.hasImage))
      .modify<any, StoryDatabaseSchema[]>(withWordSearch(query.search))
      .modify<any, StoryDatabaseSchema[]>(withOrderBy(query.orderBy, query.order))

    return this.loadStoriesWithResilientImages(stories)
  }

  async findByImageId(imageId: PostId): Promise<Story[]> {
    const database = await this.databaseOrTransaction()
    const stories = await database(this.tableName)
      .join('users', 'stories.createdById', '=', 'users.id')
      .select('stories.*', 'users.name as createdByName')
      .from<any, StoryDatabaseSchema[]>(this.tableName)
      .where({ imageId: imageId.value })

    return this.loadStoriesWithResilientImages(stories)
  }

  async findAllVisibleForLoggedInCreator(creatorId: PostCreatorId, orderBy: StorySortableKeyEnum, order: OrderEnum): Promise<Story[]> {
    const database = await this.databaseOrTransaction()
    const stories = await database(this.tableName)
      .join('users', 'stories.createdById', '=', 'users.id')
      .select('stories.*', 'users.name as createdByName')
      .from<any, StoryDatabaseSchema[]>(this.tableName)
      .whereIn('visibility', [VisibilityEnum.Public, VisibilityEnum.LoggedIn])
      .orWhere('stories.createdById', creatorId.value)
      .modify<any, StoryDatabaseSchema[]>(withOrderBy(orderBy, order))

    return this.loadStoriesWithResilientImages(stories)
  }

  async findAllForCreator(creatorId: PostCreatorId): Promise<Story[]> {
    const database = await this.databaseOrTransaction()
    const stories = await database(this.tableName)
      .join('users', 'stories.createdById', '=', 'users.id')
      .select('stories.*', 'users.name as createdByName')
      .from<any, StoryDatabaseSchema[]>(this.tableName)
      .where('stories.createdById', creatorId.value)
      .modify<any, StoryDatabaseSchema[]>(withOrderBy(StorySortableKeyEnum.NAME, OrderEnum.Ascending))

    return this.loadStoriesWithResilientImages(stories)
  }

  async findStoriesOfCreatorByName(storyName: string, creatorId: PostCreatorId): Promise<Story[]> {
    const database = await this.databaseOrTransaction()
    const stories = await database(this.tableName)
      .join('users', 'stories.createdById', '=', 'users.id')
      .select('stories.*', 'users.name as createdByName')
      .from<any, StoryDatabaseSchema[]>(this.tableName)
      .where({ createdById: creatorId.value })
      .whereLike('stories.name', `${storyName}%`)
      .modify<any, StoryDatabaseSchema[]>(withOrderBy(StorySortableKeyEnum.NAME, OrderEnum.Ascending))

    return this.loadStoriesWithResilientImages(stories)
  }

  async countStoriesByCreator(creatorId: PostCreatorId): Promise<number> {
    const database = await this.databaseOrTransaction()
    const result = await database(this.tableName)
      .count<{ count: number }>('id as count') // Count the number of story ids
      .where('createdById', creatorId.value) // Apply the condition
      .first() // Use .first() to get the first row of the result
    return result ? result.count : 0
  }

  async findById(storyId: PostId): Promise<Story | null> {
    const database = await this.databaseOrTransaction()
    const story = await database(this.tableName)
      .join('users', 'stories.createdById', '=', 'users.id')
      .select('stories.*', 'users.name as createdByName')
      .from<any, StoryDatabaseSchema>(this.tableName)
      .where('stories.id', storyId.value)
      .first()
    if (!story) {
      return null
    }

    const { image, error } = await this.loadImageSafely(story.imageId)
    return this.toDomainEntity(story, image, error)
  }

  async insert(story: Story) {
    try {
      await this.ensureUniqueId(story.id)
      const storyToInsert = this.storyMapper.toInsertQuery(story)
      const database = await this.databaseOrTransaction()

      await database(this.tableName).insert(storyToInsert) // mariadb does not return inserted object
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new DataPersistenceError({ message: error.message, cause: error })
      } else {
        logger.error(error)
        throw new DataPersistenceError({ message: 'UnknownError', cause: error })
      }
    }
    const insertedStory = await this.findStoryByIdRAW(story.id.value)
    if (!insertedStory) {
      throw new NotFoundError(`Story creation failed because just inserted story '${story.id.value}' could not be found from the database.`)
    }
    if (story.image) {
      await this.imageRepository.insert(story.image)
    }
    const { image, error } = await this.loadImageSafely(insertedStory.imageId)
    return this.toDomainEntity(insertedStory, image, error)
  }

  async update(story: Story) {
    const baseline = this.lastLoadedMap.get(story.id.value)
    if (!baseline) throw new DataPersistenceError('Repository did not load this Story')

    const storyToUpdate = this.storyMapper.toUpdateQuery(story)
    const database = await this.databaseOrTransaction()

    // Optimistic locking pattern
    const affected = await database(this.tableName).where({ id: storyToUpdate.id, updatedAt: baseline.value }).update(storyToUpdate)
    if (affected === 0) throw new ConcurrencyError<Story>(`Story ${story.id} was modified by another user`, story)

    const updatedStory = await this.findStoryByIdRAW(story.id.value)
    if (!updatedStory) {
      throw new NotFoundError(`Story update failed because just updated story '${story.id.value}' could not be found from the database.`)
    }
    if (story.image) {
      await this.imageRepository.update(story.image)
    }
    const { image, error } = await this.loadImageSafely(updatedStory.imageId)
    return this.toDomainEntity(updatedStory, image, error)
  }

  async delete(storyId: PostId) {
    try {
      const storyToDelete = await this.findById(storyId)
      const database = await this.databaseOrTransaction()

      // Optimistic locking pattern
      const affected = await database(this.tableName).where('id', storyId.value).delete()
      if (affected === 0) throw new ConcurrencyError(`Story deletion failed because story '${storyId.value}' was deleted by another user.`)

      if (storyToDelete?.image) {
        await this.imageRepository.delete(storyToDelete.image)
      }
    } catch (error: unknown) {
      return this.throwDataPersistenceError(error)
    }
  }

  // NEVER TO BE USED OUTSIDE OF THIS REPOSITORY
  // RAW in this case means without converting the stringified json data into json
  private async findStoryByIdRAW(storyId: string): Promise<StoryDatabaseSchema | null> {
    const database = await this.databaseOrTransaction()
    const story = await database(this.tableName)
      .join('users', 'stories.createdById', '=', 'users.id')
      .select('stories.*', 'users.name as createdByName')
      .from<StoryDatabaseSchema, StoryDatabaseSchema>(this.tableName)
      .where('stories.id', storyId)
      .first()
    if (!story) {
      return null
    }

    return story
  }

  private async ensureUniqueId(id: PostId): Promise<void> {
    const previousStory = await this.findById(id)
    if (previousStory) {
      throw new ForbiddenError(`Cannot create story with id ${id} because it already exists.`)
    }
  }

  private async databaseOrTransaction(): Promise<Knex | Knex.Transaction> {
    return await this.getConnection()
  }

  private async loadImageSafely(imageId: string | null): Promise<{
    image: Maybe<Image>
    error: Maybe<Error>
  }> {
    if (!imageId) {
      return {
        image: null,
        error: null
      }
    }

    try {
      const image = await this.imageRepository.findById(new ImageId(imageId))
      return {
        image,
        error: null
      }
    } catch (error) {
      if (error instanceof Error) {
        logger.warn(`Failed to load image ${imageId}: ${error.message}`)
        return {
          image: null,
          error: error
        }
      } else {
        logger.warn(`Failed to load image ${imageId}: Unknown error occurred`)
        return {
          image: null,
          error: new DataPersistenceError({ message: 'Unknown error occurred', cause: error })
        }
      }
    }
  }

  private async loadStoriesWithResilientImages(stories: StoryDatabaseSchema[]): Promise<Story[]> {
    // Create promises for all image loads, but handle failures individually
    const storyPromises = stories.map(async (story) => {
      try {
        const { image, error } = await this.loadImageSafely(story.imageId)
        return this.toDomainEntity(story, image, error)
      } catch (error) {
        if (error instanceof Error) {
          logger.warn(`Failed to load image for story ${story.id}: ${error.message}`)
          return this.toDomainEntity(story, null, error)
        } else {
          logger.warn(`Failed to load image for story ${story.id}: Unknown error occurred`)
          return this.toDomainEntity(story, null, new DataPersistenceError({ message: 'Unknown error occurred', cause: error }))
        }
      }
    })

    // Use Promise.allSettled to ensure all stories are processed even if some image loads fail
    const results = await Promise.allSettled(storyPromises)

    // Filter out rejected promises and return successful results
    return results.filter((result): result is PromiseFulfilledResult<Story> => result.status === 'fulfilled').map((result) => result.value)
  }

  private toDomainEntity(story: StoryDatabaseSchema, image: Maybe<Image>, imageLoadError?: Maybe<Error>): Story {
    this.lastLoadedMap.set(story.id, new UnixTimestamp(story.updatedAt || unixtimeNow()))
    return this.storyMapper.toDomainEntity(story, image, imageLoadError)
  }
}

const withAccess =
  (creatorId?: PostCreatorId, visibility?: VisibilityEnum[], onlyMyStories: boolean = false) =>
  (queryBuilder: Knex.QueryBuilder) => {
    const visibilityFilterIsSet = visibility?.length && visibility?.length > 0
    // double equals (==) to cover for both null and undefined
    if (creatorId?.value == null) {
      queryBuilder.where({ 'stories.visibility': 'public' }) // only public stories
    } else {
      if (onlyMyStories === true) {
        queryBuilder.where({ 'stories.createdById': creatorId.value }) // only stories created by the user
        if (visibilityFilterIsSet) {
          queryBuilder.whereIn('stories.visibility', visibility)
        }
      } else {
        if (visibilityFilterIsSet) {
          queryBuilder.whereIn('stories.visibility', visibility).andWhere((queryBuilder: Knex.QueryBuilder) => {
            queryBuilder.where({ 'stories.createdById': creatorId.value }).orWhereNot({ 'stories.visibility': 'private' })
          })
        } else {
          // all users own stories and all other stories except private stories of other users
          queryBuilder.andWhere((_queryBuilder) => {
            _queryBuilder.where({ 'stories.createdById': creatorId.value }).orWhereNot({ 'stories.visibility': 'private' })
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
