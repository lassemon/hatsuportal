import { describe, expect, it } from 'vitest'
import { uuid } from '@hatsuportal/common'
import { PostCreatorId, PostId } from '../../../../../../domain'
import { seedStoryFixture } from '../../../../../support/fixtures/storyFixture'
import { insertUsersForeignKeyStub } from '../../../../../support/fkStubs/users'
import { persistenceHarness } from '../../../../../setup.db'
import { systemWiring } from '../../../../../setup.system'
import { sampleNonAuthorUserId } from '../../../../../testFactory'

describe('FindMyStoriesUseCase (system)', () => {
  it('returns stories created by the logged-in user', async ({ unitFixture }) => {
    const { story: ownedStory } = await seedStoryFixture(persistenceHarness, unitFixture, {
      id: new PostId(uuid()),
      createdById: new PostCreatorId(unitFixture.sampleUserId)
    })
    await insertUsersForeignKeyStub(persistenceHarness, {
      id: sampleNonAuthorUserId,
      email: 'other-user-fk-stub@hatsuportal.test',
      name: 'other-user-fk-stub'
    })
    const { story: otherUserStory } = await seedStoryFixture(persistenceHarness, unitFixture, {
      id: new PostId(uuid()),
      createdById: new PostCreatorId(sampleNonAuthorUserId)
    })

    let foundStoryIds: string[] = []

    await systemWiring.createFindMyStoriesUseCaseWithValidation().execute({
      loggedInUserId: unitFixture.sampleUserId,
      storiesFound: (stories) => {
        foundStoryIds = stories.map((row) => row.id)
      }
    })

    expect(foundStoryIds).toContain(ownedStory.id.value)
    expect(foundStoryIds).not.toContain(otherUserStory.id.value)
  })
})
