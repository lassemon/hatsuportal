import { uuid, VisibilityEnum } from '@hatsuportal/common'
import {
  CoverImageId,
  PostCreatorId,
  PostId,
  PostTitle,
  PostVisibility,
  PostWriteRepository,
  Story,
  StoryBody,
  StoryInfrastructureMapper,
  StoryWriteRepository,
  PostInfrastructureMapper
} from '@hatsuportal/post-management'
import { PersistenceHarness } from '../persistence/PersistenceHarness'

export type SeedStoryFixtureOptions = {
  createdById: string
  visibility?: VisibilityEnum
  title?: string
  body?: string
}

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
  unitFixture: { storyMock: typeof import('../../testFactory').storyMock },
  { createdById, visibility, title, body }: SeedStoryFixtureOptions
): Promise<{ story: Story; storyWriteRepository: StoryWriteRepository }> {
  const story = unitFixture.storyMock({
    id: new PostId(uuid()),
    createdById: new PostCreatorId(createdById),
    coverImageId: CoverImageId.NOT_SET,
    tagIds: [],
    ...(visibility !== undefined ? { visibility: new PostVisibility(visibility) } : {}),
    ...(title !== undefined ? { title: new PostTitle(title) } : {}),
    ...(body !== undefined ? { body: new StoryBody(body) } : {})
  })
  const storyWriteRepository = createStoryWriteRepository(persistenceHarness)

  await persistenceHarness.createUnitOfWork().execute(async () => {
    await storyWriteRepository.insert(story)
    return [null]
  })

  return { story, storyWriteRepository }
}
