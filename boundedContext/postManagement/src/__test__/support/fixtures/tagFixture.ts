import { uuid } from '@hatsuportal/common'
import { Tag, TagCreatorId, TagId, TagName, TagSlug } from '../../../domain'
import { CreatedAtTimestamp, UnixTimestamp } from '@hatsuportal/shared-kernel'
import { unixtimeNow } from '@hatsuportal/common'
import { TagRepository } from '../../../infrastructure/repositories/TagRepository'
import { TagInfrastructureMapper } from '../../../infrastructure/mappers/TagInfrastructureMapper'
import { PersistenceHarness } from '../persistence/PersistenceHarness'

export function createTagRepository(persistenceHarness: PersistenceHarness): TagRepository {
  return new TagRepository(
    persistenceHarness.dataAccessProvider,
    persistenceHarness.repositoryHelpers,
    persistenceHarness.transactionContext,
    new TagInfrastructureMapper()
  )
}

export async function seedTagFixture(
  persistenceHarness: PersistenceHarness,
  unitFixture: { sampleUserId: string },
  slugSuffix = uuid().slice(0, 8)
): Promise<{ tag: Tag; tagRepository: TagRepository }> {
  const now = unixtimeNow()
  const tag = Tag.reconstruct({
    id: new TagId(uuid()),
    slug: new TagSlug(`tag-${slugSuffix}`),
    name: new TagName(`Tag ${slugSuffix}`),
    createdById: new TagCreatorId(unitFixture.sampleUserId),
    createdAt: new CreatedAtTimestamp(now),
    updatedAt: new UnixTimestamp(now)
  })
  const tagRepository = createTagRepository(persistenceHarness)

  await persistenceHarness.createUnitOfWork().execute(async () => {
    await tagRepository.insert(tag)
    return [null]
  })

  return { tag, tagRepository }
}
