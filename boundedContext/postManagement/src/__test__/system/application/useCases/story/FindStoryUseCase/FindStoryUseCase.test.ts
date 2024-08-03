import { describe, expect, it } from 'vitest'
import { seedStoryFixture } from '../../../../../support/fixtures/storyFixture'
import { persistenceHarness } from '../../../../../setup.db'
import { systemWiring } from '../../../../../setup.system'

describe('FindStoryUseCase (system)', () => {
  it('finds a seeded story by id through the lookup service', async ({ unitFixture }) => {
    const { story } = await seedStoryFixture(persistenceHarness, unitFixture)
    let foundId = ''

    await systemWiring.createFindStoryUseCaseWithValidation().execute({
      loggedInUserId: unitFixture.sampleUserId,
      findStoryInput: {
        storyIdToFind: story.id.value
      },
      storyFound: (foundStory) => {
        foundId = foundStory.id
      }
    })

    expect(foundId).toBe(story.id.value)
  })
})
