import { uuid } from '@hatsuportal/common'
import { PostWriteRepository } from '../../../infrastructure/repositories/PostWriteRepository'
import { StoryWriteRepository } from '../../../infrastructure/repositories/StoryWriteRepository'
import { PostInfrastructureMapper } from '../../../infrastructure/mappers/PostInfrastructureMapper'
import { StoryInfrastructureMapper } from '../../../infrastructure/mappers/StoryInfrastructureMapper'
import { CoverImageId, PostCreatorId, PostId, Story } from '../../../domain'
import { PersistenceHarness } from '../persistence/PersistenceHarness'

export function createStoryWriteRepository(persistenceHarness: PersistenceHarness): StoryWriteRepository {
  const postWriteRepository = new PostWriteRepository(
    persistenceHarness.dataAccessProvider,
    persistenceHarness.repositoryHelpers,
    persistenceHarness.transactionContext
  )

  return new StoryWriteRepository(
    persistenceHarness.dataAccessProvider,
    persistenceHarness.repositoryHelpers,
    persistenceHarness.transactionContext,
    new PostInfrastructureMapper(),
    new StoryInfrastructureMapper(),
    postWriteRepository
  )
}

export async function seedStoryFixture(
  persistenceHarness: PersistenceHarness,
  unitFixture: { storyMock: typeof import('../../testFactory').storyMock; sampleUserId: string },
  overrides: Parameters<typeof unitFixture.storyMock>[0] = {}
): Promise<{ story: Story; storyWriteRepository: StoryWriteRepository }> {
  const storyId = uuid()
  const story = unitFixture.storyMock({
    id: new PostId(storyId),
    createdById: new PostCreatorId(unitFixture.sampleUserId),
    coverImageId: CoverImageId.NOT_SET,
    tagIds: [],
    ...overrides
  })
  const storyWriteRepository = createStoryWriteRepository(persistenceHarness)

  await persistenceHarness.createUnitOfWork().execute(async () => {
    await storyWriteRepository.insert(story)
    return [null]
  })

  return { story, storyWriteRepository }
}
