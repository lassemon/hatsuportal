import { describe, expect, it } from 'vitest'
import { AddCommentTargetKind } from '../../../../../../application/dtos/useCase/AddCommentInputDTO'
import { CommentEventTypes } from '../../../../../../domain/events/CommentEvents'
import { seedStoryFixture } from '../../../../../support/fixtures/storyFixture'
import { persistenceHarness } from '../../../../../setup.db'
import { systemWiring } from '../../../../../setup.system'
import { CommentId } from '../../../../../../domain'

describe('AddCommentUseCase (system)', () => {
  it('adds a comment to a story and persists domain event to outbox', async ({ unitFixture }) => {
    const { story } = await seedStoryFixture(persistenceHarness, unitFixture)
    let createdCommentId = ''

    await systemWiring.createAddCommentUseCaseWithValidation().execute({
      addCommentInput: {
        postId: story.id.value,
        authorId: unitFixture.sampleUserId,
        body: 'System test comment',
        target: { kind: AddCommentTargetKind.TopLevel, postId: story.id.value }
      },
      commentCreated: (comment) => {
        createdCommentId = comment.id
      }
    })

    expect(createdCommentId).toBeTruthy()

    const loaded = await systemWiring.commentReadRepository.getById(new CommentId(createdCommentId))
    expect(loaded.body).toBe('System test comment')

    const outbox = await systemWiring.persistenceHarness.findOutboxEventsForAggregate(createdCommentId)
    expect(outbox.some((event) => event.eventType === CommentEventTypes.CommentCreated)).toBe(true)
  })
})
