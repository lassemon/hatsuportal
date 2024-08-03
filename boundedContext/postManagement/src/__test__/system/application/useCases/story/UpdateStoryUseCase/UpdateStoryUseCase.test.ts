import { describe, expect, it } from 'vitest'
import { VisibilityEnum } from '@hatsuportal/common'
import { PostId } from '../../../../../../domain'
import { StoryEventTypes } from '../../../../../../domain/events/StoryEvents'
import { seedStoryFixture } from '../../../../../support/fixtures/storyFixture'
import { persistenceHarness } from '../../../../../setup.db'
import { systemWiring } from '../../../../../setup.system'

describe('UpdateStoryUseCase (system)', () => {
  it('updates story title and persists domain event to outbox', async ({ unitFixture }) => {
    const { story } = await seedStoryFixture(persistenceHarness, unitFixture)
    const updatedTitle = 'Updated system test title'
    let updatedStoryId = ''

    await systemWiring.createUpdateStoryUseCaseWithValidation().execute({
      updatedById: unitFixture.sampleUserId,
      updateStoryInput: {
        id: story.id.value,
        title: updatedTitle
      },
      storyUpdated: (updatedStory) => {
        updatedStoryId = updatedStory.id
      },
      updateConflict: () => {
        throw new Error('unexpected conflict')
      }
    })

    expect(updatedStoryId).toBe(story.id.value)

    const loaded = await systemWiring.storyReadRepository.findById(new PostId(story.id.value))
    expect(loaded?.title).toBe(updatedTitle)
    expect(loaded?.visibility).toBe(VisibilityEnum.Public)

    const outbox = await systemWiring.persistenceHarness.findOutboxEventsForAggregate(story.id.value)
    expect(outbox.some((event) => event.eventType === StoryEventTypes.StoryTitleUpdated)).toBe(true)
  })
})
