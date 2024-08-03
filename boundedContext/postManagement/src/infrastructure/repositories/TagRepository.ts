import { unixtimeNow } from '@hatsuportal/common'
import { RepositoryBase, IDataAccessProvider, IRepositoryHelpers, ITransactionContext, ConcurrencyError } from '@hatsuportal/platform'
import { ITagRepository, Tag, TagId, TagName, TagSlug, TagCreatorId } from '../../domain'
import { ITagInfrastructureMapper } from '../mappers/TagInfrastructureMapper'
import { TagDatabaseSchema } from '../schemas/TagDatabaseSchema'
import { CreatedAtTimestamp, UnixTimestamp } from '@hatsuportal/shared-kernel'

// TODO, split into write and read repositories
// when implementing read-heavy operations such as
// "browse by tag" or tag list for every user on frontpage
export class TagRepository extends RepositoryBase implements ITagRepository {
  constructor(
    dataAccessProvider: IDataAccessProvider,
    helpers: IRepositoryHelpers,
    transactionContext: ITransactionContext,
    private readonly tagInfrastructureMapper: ITagInfrastructureMapper
  ) {
    super(dataAccessProvider, helpers, transactionContext, 'tags')
  }

  async findById(tagId: TagId): Promise<Tag | null> {
    const tag = await this.findByIdRAW(tagId.value)
    return tag ? this.toDomainEntity(tag) : null
  }

  async findByIdForUpdate(tagId: TagId): Promise<Tag | null> {
    const tag = await this.table<TagDatabaseSchema>().select('*').where('id', tagId.value).forUpdate().first()
    if (!tag) {
      return null
    }

    this.registerExpectedUpdatedAt(tag.id, new UnixTimestamp(tag.updatedAt || unixtimeNow()))

    return this.toDomainEntity(tag)
  }

  async findByIds(tagIds: TagId[]): Promise<Tag[]> {
    const tags = await this.table<TagDatabaseSchema>()
      .select('*')
      .whereIn(
        'id',
        tagIds.map((id) => id.value)
      )
    return tags.map((tag) => this.toDomainEntity(tag))
  }

  async findAll(): Promise<Tag[]> {
    const tags = await this.table<TagDatabaseSchema>().select('*')
    return tags.map((tag) => this.toDomainEntity(tag))
  }

  async insert(tag: Tag): Promise<Tag> {
    try {
      const previousTag = await this.findById(tag.id)

      if (previousTag) {
        return previousTag // idempotent no-op
      }

      const tagToInsert = this.tagInfrastructureMapper.toTagInsertRecord(tag)
      const affected = await this.table<TagDatabaseSchema>().insert(tagToInsert)
      if (affected.length === 0) throw new ConcurrencyError<Tag>(`Tag ${tag.id} was modified by another user`, tag)

      return this.toDomainEntity(affected[0])
    } catch (error: unknown) {
      return this.helpers.throwDataPersistenceError(error)
    }
  }

  async insertMany(tags: Tag[]): Promise<Tag[]> {
    try {
      const affected = await this.table<TagDatabaseSchema>().insert(tags.map((tag) => this.tagInfrastructureMapper.toTagInsertRecord(tag)))
      return affected.map((tag) => this.toDomainEntity(tag))
    } catch (error: unknown) {
      return this.helpers.throwDataPersistenceError(error)
    }
  }

  async update(tag: Tag): Promise<Tag> {
    try {
      const expectedUpdatedAt = this.requireExpectedUpdatedAt(tag.id.value)

      const tagToUpdate = this.tagInfrastructureMapper.toTagUpdateRecord(tag)
      const affected = await this.table<TagDatabaseSchema>()
        .where({ id: tag.id.value, updatedAt: expectedUpdatedAt.value })
        .update(tagToUpdate)
      if (affected.length === 0) throw new ConcurrencyError<Tag>(`Tag ${tag.id} was modified by another user`, tag)

      return this.toDomainEntity(affected[0])
    } catch (error: unknown) {
      return this.helpers.throwDataPersistenceError(error)
    }
  }

  async delete(tag: Tag): Promise<void> {
    try {
      const expectedUpdatedAt = this.requireExpectedUpdatedAt(tag.id.value)

      const affected = await this.table<TagDatabaseSchema>().where({ id: tag.id.value, updatedAt: expectedUpdatedAt.value }).delete()
      if (affected.length === 0) throw new ConcurrencyError<Tag>(`Tag ${tag.id} was modified by another user`, tag)
    } catch (error: unknown) {
      return this.helpers.throwDataPersistenceError(error)
    }
  }

  async deleteMany(tagIds: TagId[]): Promise<void> {
    try {
      await this.table<TagDatabaseSchema>()
        .whereIn(
          'id',
          tagIds.map((id) => id.value)
        )
        .delete()
    } catch (error: unknown) {
      return this.helpers.throwDataPersistenceError(error)
    }
  }

  private async findByIdRAW(id: string): Promise<TagDatabaseSchema | null> {
    return await this.table<TagDatabaseSchema>().select('*').where('id', id).first()
  }

  private toDomainEntity(tag: TagDatabaseSchema): Tag {
    return Tag.reconstruct({
      id: new TagId(tag.id),
      slug: new TagSlug(tag.slug),
      name: new TagName(tag.name),
      createdById: new TagCreatorId(tag.createdById),
      createdAt: new CreatedAtTimestamp(tag.createdAt),
      updatedAt: new UnixTimestamp(tag.updatedAt)
    })
  }
}
