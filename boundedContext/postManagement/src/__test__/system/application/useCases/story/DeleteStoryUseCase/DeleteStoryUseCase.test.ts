import { describe, expect, it } from 'vitest'
import { PostId } from '../../../../../../domain'
import { StoryEventTypes } from '../../../../../../domain/events/StoryEvents'
import { seedStoryFixture } from '../../../../../support/fixtures/storyFixture'
import { persistenceHarness } from '../../../../../setup.db'
import { systemWiring } from '../../../../../setup.system'

describe('DeleteStoryUseCase (system)', () => {
  it('deletes a story and persists domain event to outbox', async ({ unitFixture }) => {
    const { story } = await seedStoryFixture(persistenceHarness, unitFixture)
    let deletedStoryId = ''

    await systemWiring.createDeleteStoryUseCaseWithValidation().execute({
      deletedById: unitFixture.sampleUserId,
      deleteStoryInput: {
        storyIdToDelete: story.id.value
      },
      storyDeleted: (deletedStory) => {
        deletedStoryId = deletedStory.id
      },
      deleteConflict: () => {
        throw new Error('unexpected conflict')
      }
    })

    expect(deletedStoryId).toBe(story.id.value)

    const loaded = await systemWiring.storyReadRepository.findById(new PostId(story.id.value))
    expect(loaded).toBeNull()

    const outbox = await systemWiring.persistenceHarness.findOutboxEventsForAggregate(story.id.value)
    expect(outbox.some((event) => event.eventType === StoryEventTypes.StoryDeleted)).toBe(true)
  })
})
