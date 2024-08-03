import { UnixTimestamp } from '@hatsuportal/shared-kernel'
import { unixtimeNow, EntityTypeEnum, ImageRoleEnum } from '@hatsuportal/common'
import {
  RepositoryBase,
  ITransactionAware,
  IDataAccessProvider,
  IRepositoryHelpers,
  ITransaction,
  DataPersistenceError,
  NotFoundError,
  ConcurrencyError
} from '@hatsuportal/platform'
import { IStoryWriteRepository, Story, PostId } from '../../domain'
import { IPostInfrastructureMapper } from '../mappers/PostInfrastructureMapper'
import { IStoryInfrastructureMapper } from '../mappers/StoryInfrastructureMapper'
import { IPostWriteRepository } from './IPostWriteRepository'
import { StoryDatabaseSchema } from '../schemas/StoryDatabaseSchema'

export class StoryWriteRepository extends RepositoryBase implements IStoryWriteRepository, ITransactionAware {
  private readonly imageLinkTable: string
  private readonly tagLinkTable: string

  constructor(
    dataAccessProvider: IDataAccessProvider,
    helpers: IRepositoryHelpers,
    private readonly postMapper: IPostInfrastructureMapper,
    private readonly storyMapper: IStoryInfrastructureMapper,
    private readonly postWriteRepository: IPostWriteRepository & ITransactionAware
  ) {
    super(dataAccessProvider, helpers, 'stories')
    this.imageLinkTable = 'post_image_links'
    this.tagLinkTable = 'post_tag_links'
  }

  override setTransaction(transaction: ITransaction | null): void {
    super.setTransaction(transaction)
    this.postWriteRepository.setTransaction(transaction)
  }

  override clearLastLoadedMap(): void {
    super.clearLastLoadedMap()
    this.postWriteRepository.clearLastLoadedMap()
  }

  async findByIdForUpdate(storyId: PostId): Promise<Story | null> {
    const post = await this.postWriteRepository.findByIdForUpdate(storyId.value)
    const story = await this.findStoryByIdRAW(storyId.value)
    if (!story || !post) {
      return null
    }

    this.lastLoadedMap.set(story.id, new UnixTimestamp(post.updatedAt || unixtimeNow()))

    return this.toDomainEntity(story)
  }

  async insert(story: Story) {
    try {
      // 1) Write the supertype row
      const postRecord = this.postMapper.toPostInsertRecord(story, EntityTypeEnum.Story)
      await this.postWriteRepository.insert(postRecord)

      // 2) Write the subtype row
      const storyToInsert = this.storyMapper.toStoryInsertRecord(story)
      await this.table<StoryDatabaseSchema>().insert(storyToInsert)

      // 3) Update the linking tables
      await this.updateImageLink(story)
      await this.updateTags(story)
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new DataPersistenceError({ message: error.message, cause: error })
      } else {
        throw new DataPersistenceError({ message: 'UnknownError', cause: error })
      }
    }
    const reloaded = await this.findStoryByIdRAW(story.id.value)
    if (!reloaded) {
      throw new NotFoundError(`Story creation failed because just inserted story '${story.id.value}' could not be found from the database.`)
    }
    return this.toDomainEntity(reloaded)
  }

  async update(story: Story) {
    // baseline is set in findByIdForUpdate
    // this forces use cases to load the story before updating it.
    // protects against race conditions
    const baseline = this.lastLoadedMap.get(story.id.value)
    if (!baseline) throw new DataPersistenceError('Repository did not load this Story')

    // 1) Update the supertype row
    const postUpdate = this.postMapper.toPostUpdateRecord(story, EntityTypeEnum.Story)
    const postAffected = await this.postWriteRepository.update(postUpdate, baseline)

    // Optimistic locking pattern
    if (postAffected === 0) {
      throw new ConcurrencyError<Story>(`Story ${story.id.value} was modified by another user`, story)
    }

    const storyToUpdate = this.storyMapper.toStoryUpdateRecord(story)

    // 2) Write the subtype row
    await this.table<StoryDatabaseSchema>().where({ id: storyToUpdate.id }).update(storyToUpdate)

    // 3) Update the linking tables
    await this.updateImageLink(story)
    await this.updateTags(story)

    const reloaded = await this.findStoryByIdRAW(story.id.value)
    if (!reloaded) {
      throw new NotFoundError(`Story update failed because just updated story '${story.id.value}' could not be found from the database.`)
    }
    return this.toDomainEntity(reloaded)
  }

  async delete(story: Story) {
    try {
      // baseline is set in findByIdForUpdate
      // this forces use cases to load the story before updating it.
      // protects against race conditions
      const baseline = this.lastLoadedMap.get(story.id.value)
      if (!baseline) throw new DataPersistenceError('Repository did not load this Story')

      // Deleting the supertype row will cascade to stories, image, tag and comment link tables (ON DELETE CASCADE)
      // Optimistic locking pattern
      const affected = await this.postWriteRepository.deleteById(story.id.value, baseline)
      if (affected === 0) throw new ConcurrencyError(`Story deletion failed because story '${story.id.value}' was deleted by another user.`)

      return story
    } catch (error: unknown) {
      return this.helpers.throwDataPersistenceError(error)
    }
  }

  // NEVER TO BE USED OUTSIDE OF THIS REPOSITORY
  // RAW in this case means without mapping to domain entities
  // but still including linking ids (coverImageId, tagIds, commentIds)
  private async findStoryByIdRAW(storyId: string): Promise<StoryDatabaseSchema | null> {
    const database = await this.database()
    const story = await this.table<StoryDatabaseSchema>()
      .leftJoin(this.postWriteRepository.getTableName(), (join) => join.on('posts.id', '=', 'stories.id'))
      .leftJoin(this.imageLinkTable!, (join) =>
        join
          .on(`${this.imageLinkTable}.post_id`, '=', 'stories.id')
          .andOn(`${this.imageLinkTable}.role`, '=', database.raw('?', [ImageRoleEnum.Cover]))
      )
      .joinRaw(
        `
          LEFT JOIN LATERAL (
            SELECT array_remove(array_agg(${this.tagLinkTable}.tag_id ORDER BY ${this.tagLinkTable}.tag_id), NULL) AS tag_ids
            FROM ${this.tagLinkTable}
            WHERE ${this.tagLinkTable}.post_id = posts.id
          ) AS post_tag_aggregation ON TRUE
        `
      )
      // TODO: add commentIds
      .select(
        `${this.tableName}.*`,
        `${this.postWriteRepository.getTableName()}.created_by_id as created_by_id`,
        `${this.postWriteRepository.getTableName()}.created_at as created_at`,
        `${this.postWriteRepository.getTableName()}.updated_at as updated_at`,
        `${this.imageLinkTable}.image_id as cover_image_id`,
        database.raw('COALESCE(post_tag_aggregation.tag_ids, ARRAY[]::uuid[]) AS tag_ids')
      )
      .where(`${this.tableName}.id`, storyId)
      .first()

    if (!story) {
      return null
    }
    return story
  }

  // This could also be a separate repository (StoryImageLinkRepository), refactor if it grows more complex
  private async updateImageLink(story: Story) {
    const database = await this.database()
    const imageLinkRow = this.storyMapper.toImageLinkRow(story)
    const existingImageLink = await database.table(this.imageLinkTable).where({ postId: story.id.value, role: ImageRoleEnum.Cover }).first()

    // Remove link
    if (imageLinkRow === null && existingImageLink) {
      await database.table(this.imageLinkTable).where({ postId: story.id.value, role: ImageRoleEnum.Cover }).delete()
      return
    }

    // Create link
    if (imageLinkRow && !existingImageLink) {
      await database.table(this.imageLinkTable).insert({ ...imageLinkRow, createdAt: unixtimeNow() })
      return
    }

    // Replace link
    if (imageLinkRow && existingImageLink && imageLinkRow.imageId !== existingImageLink.imageId) {
      await database.table(this.imageLinkTable).where({ postId: story.id.value, role: ImageRoleEnum.Cover }).update(imageLinkRow)
      return
    }
  }

  // This could also be a separate repository (StoryTagLinkRepository), refactor if it grows more complex
  private async updateTags(story: Story) {
    const database = await this.database()
    await database.table(this.tagLinkTable).where({ postId: story.id.value }).delete()

    const tags = story.tagIds
    if (tags.length > 0) {
      await database
        .table(this.tagLinkTable)
        .insert(tags.map((tag) => ({ postId: story.id.value, tagId: tag.value, createdAt: unixtimeNow() })))
    }
  }

  private toDomainEntity(story: StoryDatabaseSchema): Story {
    return this.storyMapper.toDomainEntity(story)
  }
}
