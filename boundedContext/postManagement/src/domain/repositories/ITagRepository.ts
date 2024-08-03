import { Tag } from '../entities/Tag'
import { TagId } from '../valueObjects/TagId'

export interface ITagRepository {
  findById(tagId: TagId): Promise<Tag | null>
  findByIds(tagIds: TagId[]): Promise<Tag[]>
  findAll(): Promise<Tag[]>
  insert(tag: Tag): Promise<Tag>
  insertMany(tags: Tag[]): Promise<Tag[]>
  update(tag: Tag): Promise<Tag>
  delete(tag: Tag): Promise<void>
  deleteMany(tagIds: TagId[]): Promise<void>
}
