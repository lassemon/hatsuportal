import { Repository } from './Repository'
import { isEmpty } from 'lodash'
import { ConcurrencyError, ForbiddenError, ITransactionAware } from '@hatsuportal/platform'
import { unixtimeNow } from '@hatsuportal/common'
import { NonEmptyString, UnixTimestamp } from '@hatsuportal/shared-kernel'
import {
  ITagRepository,
  TagDatabaseSchema,
  TagSlug,
  Tag,
  TagId,
  TagCreatorId,
  ITagInfrastructureMapper
} from '@hatsuportal/post-management'

// TODO, split into write and read repositories
export class TagRepository extends Repository implements ITagRepository, ITransactionAware {
  constructor(private readonly tagInfrastructureMapper: ITagInfrastructureMapper) {
    super('tags')
    this.toDomainEntity = this.toDomainEntity.bind(this)
  }

  async findById(tagId: TagId): Promise<Tag | null> {
    const database = await this.databaseOrTransaction()
    const tag = await database(this.tableName).select('*').from<TagDatabaseSchema>(this.tableName).where('id', tagId.value).first()
    return tag ? this.toDomainEntity(tag) : null
  }

  async findByIds(tagIds: TagId[]): Promise<Tag[]> {
    const database = await this.databaseOrTransaction()
    const tags = await database(this.tableName)
      .select('*')
      .from<TagDatabaseSchema>(this.tableName)
      .whereIn(
        'id',
        tagIds.map((id) => id.value)
      )
    return tags.map((tag) => this.toDomainEntity(tag))
  }

  async findAll(): Promise<Tag[]> {
    const database = await this.databaseOrTransaction()
    const tags = await database(this.tableName).select('*').from<TagDatabaseSchema>(this.tableName)
    return tags.map((tag) => this.toDomainEntity(tag))
  }

  async insert(tag: Tag): Promise<Tag> {
    try {
      await this.ensureUniqueId(tag.id)
      const database = await this.databaseOrTransaction()

      // Optimistic locking pattern
      const tagToInsert = this.tagInfrastructureMapper.toTagInsertRecord(tag)
      const affected = await database(this.tableName).insert(tagToInsert).returning<TagDatabaseSchema[]>('*')
      if (isEmpty(affected)) throw new ConcurrencyError<Tag>(`Tag ${tag.id} was modified by another user`, tag)

      return this.toDomainEntity(affected[0])
    } catch (error: unknown) {
      return this.throwDataPersistenceError(error)
    }
  }

  async insertMany(tags: Tag[]): Promise<Tag[]> {
    try {
      const database = await this.databaseOrTransaction()
      const affected = await database(this.tableName)
        .insert(tags.map((tag) => this.tagInfrastructureMapper.toTagInsertRecord(tag)))
        .returning<TagDatabaseSchema[]>('*')
      return affected.map((tag) => this.toDomainEntity(tag))
    } catch (error: unknown) {
      return this.throwDataPersistenceError(error)
    }
  }

  async update(tag: Tag): Promise<Tag> {
    try {
      const database = await this.databaseOrTransaction()

      // Optimistic locking pattern
      const tagToUpdate = this.tagInfrastructureMapper.toTagUpdateRecord(tag)
      const affected = await database(this.tableName).where('id', tag.id.value).update(tagToUpdate).returning<TagDatabaseSchema[]>('*')
      if (isEmpty(affected)) throw new ConcurrencyError<Tag>(`Tag ${tag.id} was modified by another user`, tag)

      return this.toDomainEntity(affected[0])
    } catch (error: unknown) {
      return this.throwDataPersistenceError(error)
    }
  }

  async delete(tag: Tag): Promise<void> {
    try {
      const database = await this.databaseOrTransaction()

      // Optimistic locking pattern
      const affected = await database(this.tableName).where('id', tag.id.value).delete()
      if (affected === 0) throw new ConcurrencyError<Tag>(`Tag ${tag.id} was modified by another user`, tag)
    } catch (error: unknown) {
      return this.throwDataPersistenceError(error)
    }
  }

  async deleteMany(tagIds: TagId[]): Promise<void> {
    try {
      const database = await this.databaseOrTransaction()
      await database(this.tableName)
        .whereIn(
          'id',
          tagIds.map((id) => id.value)
        )
        .delete()
    } catch (error: unknown) {
      return this.throwDataPersistenceError(error)
    }
  }

  private async ensureUniqueId(id: TagId): Promise<void> {
    const previousTag = await this.findById(id)
    if (previousTag) {
      throw new ForbiddenError(`Cannot create tag with id ${id} because it already exists.`)
    }
  }

  private toDomainEntity(tag: TagDatabaseSchema): Tag {
    this.lastLoadedMap.set(tag.id, new UnixTimestamp(tag.updatedAt || unixtimeNow()))
    return Tag.reconstruct({
      id: new TagId(tag.id),
      slug: new TagSlug(tag.slug),
      name: new NonEmptyString(tag.name),
      createdById: new TagCreatorId(tag.createdById),
      createdAt: new UnixTimestamp(tag.createdAt),
      updatedAt: new UnixTimestamp(tag.updatedAt)
    })
  }
}
