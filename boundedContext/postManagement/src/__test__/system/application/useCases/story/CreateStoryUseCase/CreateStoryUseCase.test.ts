import { describe, expect, it } from 'vitest'
import { VisibilityEnum } from '@hatsuportal/common'
import { PostId } from '../../../../../../domain'
import { StoryEventTypes } from '../../../../../../domain/events/StoryEvents'
import { sampleUserId } from '../../../../../testFactory'
import { systemWiring } from '../../../../../setup.system'

describe('CreateStoryUseCase (system)', () => {
  it('creates a story without cover image and persists domain event to outbox', async () => {
    let createdId = ''

    await systemWiring.createCreateStoryUseCaseWithValidation().execute({
      createdById: sampleUserId,
      createStoryInput: {
        visibility: VisibilityEnum.Public,
        title: 'System Test Story',
        body: 'A story created in system tests.',
        image: null,
        tags: []
      },
      storyCreated: (story) => {
        createdId = story.id
      }
    })

    expect(createdId).toBeTruthy()

    const loaded = await systemWiring.storyReadRepository.findById(new PostId(createdId))
    expect(loaded).not.toBeNull()
    expect(loaded?.coverImageId).toBeNull()

    const outbox = await systemWiring.persistenceHarness.findOutboxEventsForAggregate(createdId)
    expect(outbox.some((event) => event.eventType === StoryEventTypes.StoryCreated)).toBe(true)
  })
})
