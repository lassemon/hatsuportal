import { unixtimeNow } from '@hatsuportal/common'
import {
  RepositoryBase,
  ITransactionAware,
  IDataAccessProvider,
  IRepositoryHelpers,
  ForbiddenError,
  ConcurrencyError
} from '@hatsuportal/platform'
import { ITagRepository, Tag, TagId, TagSlug, TagCreatorId } from '../../domain'
import { ITagInfrastructureMapper } from '../mappers/TagInfrastructureMapper'
import { isEmpty } from 'lodash'
import { TagDatabaseSchema } from '../schemas/TagDatabaseSchema'
import { NonEmptyString, UnixTimestamp } from '@hatsuportal/shared-kernel'

// TODO, split into write and read repositories
export class TagRepository extends RepositoryBase implements ITagRepository, ITransactionAware {
  constructor(
    dataAccessProvider: IDataAccessProvider,
    helpers: IRepositoryHelpers,
    private readonly tagInfrastructureMapper: ITagInfrastructureMapper
  ) {
    super(dataAccessProvider, helpers, 'tags')
    this.toDomainEntity = this.toDomainEntity.bind(this)
  }

  async findById(tagId: TagId): Promise<Tag | null> {
    const tag = await this.table<TagDatabaseSchema>().select('*').where('id', tagId.value).first()
    return tag ? this.toDomainEntity(tag) : null
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
      await this.ensureUniqueId(tag.id)

      // Optimistic locking pattern
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
      // Optimistic locking pattern
      const tagToUpdate = this.tagInfrastructureMapper.toTagUpdateRecord(tag)
      const affected = await this.table<TagDatabaseSchema>().where('id', tag.id.value).update(tagToUpdate)
      if (isEmpty(affected)) throw new ConcurrencyError<Tag>(`Tag ${tag.id} was modified by another user`, tag)

      return this.toDomainEntity(affected[0])
    } catch (error: unknown) {
      return this.helpers.throwDataPersistenceError(error)
    }
  }

  async delete(tag: Tag): Promise<void> {
    try {
      // Optimistic locking pattern
      const affected = await this.table<TagDatabaseSchema>().where('id', tag.id.value).delete()
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
