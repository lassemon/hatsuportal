import { ICache, ITransaction, ITransactionAware } from '@hatsuportal/platform'
import { ITagRepository, Tag, TagId } from '../../domain'

export class TagRepositoryWithCache implements ITagRepository, ITransactionAware {
  constructor(
    private readonly baseRepo: ITagRepository & ITransactionAware,
    private readonly cache: ICache<Tag | Tag[]>
  ) {}

  async findById(tagId: TagId): Promise<Tag | null> {
    const key = `findById:${tagId.value}`
    if (!this.cache.has(key)) {
      const tag = await this.baseRepo.findById(tagId)
      this.cache.set(key, tag)
    }
    const cached = this.cache.get(key)
    return !Array.isArray(cached) ? (cached ?? null) : null
  }

  async findByIds(tagIds: TagId[]): Promise<Tag[]> {
    return await this.baseRepo.findByIds(tagIds)
  }

  async findAll(): Promise<Tag[]> {
    const key = 'findAll'
    if (!this.cache.has(key)) {
      const tags = await this.baseRepo.findAll()
      this.cache.set(key, tags)
    }
    const cached = this.cache.get(key)
    return Array.isArray(cached) ? cached : []
  }

  async insert(tag: Tag): Promise<Tag> {
    const result = await this.baseRepo.insert(tag)
    this.cache.delete('findAll')
    return result
  }

  async insertMany(tags: Tag[]): Promise<Tag[]> {
    const result = await this.baseRepo.insertMany(tags)
    this.cache.delete('findAll')
    return result
  }

  async update(tag: Tag): Promise<Tag> {
    const result = await this.baseRepo.update(tag)
    this.cache.delete(`findById:${result.id.value}`)
    this.cache.delete('findAll')
    return result
  }

  async delete(tag: Tag): Promise<void> {
    await this.baseRepo.delete(tag)
    this.cache.delete(`findById:${tag.id.value}`)
    this.cache.delete('findAll')
  }

  async deleteMany(tagIds: TagId[]): Promise<void> {
    await this.baseRepo.deleteMany(tagIds)
    for (const tagId of tagIds) {
      this.cache.delete(`findById:${tagId.value}`)
    }
    this.cache.delete('findAll')
  }

  getTableName(): string {
    return this.baseRepo.getTableName()
  }

  setTransaction(transaction: ITransaction): void {
    this.baseRepo.setTransaction(transaction)
  }

  clearLastLoadedMap(): void {
    this.baseRepo.clearLastLoadedMap()
  }
}
