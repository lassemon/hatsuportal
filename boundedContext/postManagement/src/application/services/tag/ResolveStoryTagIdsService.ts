import { CreatedAtTimestamp, NonEmptyString, UniqueId, UnixTimestamp } from '@hatsuportal/shared-kernel'
import { TagInputDTO } from '../../dtos/useCase/TagInputDTO'
import { ITagRepository, Tag, TagCreatorId, TagId, TagSlug } from '../../../domain'
import { InvalidInputError, ITransactionAware } from '@hatsuportal/platform'
import { unixtimeNow, uuid } from '@hatsuportal/common'

export interface IResolveStoryTagIdsService {
  resolve(createdBy: UniqueId, incomingTags: TagInputDTO[]): Promise<string[]>
}

export class ResolveStoryTagIdsService implements IResolveStoryTagIdsService {
  constructor(private readonly tagRepository: ITagRepository & ITransactionAware) {}
  async resolve(createdBy: UniqueId, incomingTags: TagInputDTO[]): Promise<string[]> {
    const tagsToCreate = incomingTags.filter((tag): tag is { name: string } => !('id' in tag) && 'name' in tag)
    const tagsAlreadyInDb = incomingTags.filter((tag): tag is { id: string } => 'id' in tag)

    const accounted = tagsToCreate.length + tagsAlreadyInDb.length
    if (accounted !== incomingTags.length) {
      throw new InvalidInputError('Each tag entry must be either { id } or { name }.')
    }

    const existingIdsInOrder = tagsAlreadyInDb.map((t) => t.id)
    if (existingIdsInOrder.length > 0) {
      const uniqueIds = [...new Set(existingIdsInOrder)]
      const found = await this.tagRepository.findByIds(uniqueIds.map((id) => new TagId(id)))
      if (found.length !== uniqueIds.length) {
        const foundSet = new Set(found.map((tag) => tag.id.value))
        const missing = uniqueIds.filter((id) => !foundSet.has(id))
        throw new InvalidInputError(`One or more tag ids do not exist: ${missing.join(', ')}`)
      }
    }

    const now = unixtimeNow()
    const tagsToInsert = tagsToCreate.map((tag) =>
      Tag.create({
        id: new TagId(uuid()),
        name: new NonEmptyString(tag.name.trim()),
        slug: new TagSlug(tag.name.trim()),
        createdById: new TagCreatorId(createdBy.value),
        createdAt: new CreatedAtTimestamp(now),
        updatedAt: new UnixTimestamp(now)
      })
    )
    const created = tagsToInsert.length > 0 ? await this.tagRepository.insertMany(tagsToInsert) : []

    return [...tagsAlreadyInDb.map((t) => t.id), ...created.map((t) => t.id.value)]
  }
}
