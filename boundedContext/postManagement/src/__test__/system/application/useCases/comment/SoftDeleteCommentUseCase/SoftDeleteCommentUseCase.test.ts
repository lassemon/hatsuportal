import { describe, expect, it } from 'vitest'
import { CommentEventTypes } from '../../../../../../domain/events/CommentEvents'
import { seedCommentFixture } from '../../../../../support/fixtures/commentFixture'
import { persistenceHarness } from '../../../../../setup.db'
import { systemWiring } from '../../../../../setup.system'

describe('SoftDeleteCommentUseCase (system)', () => {
  it('soft deletes a comment and persists domain event to outbox', async ({ unitFixture }) => {
    const { comment } = await seedCommentFixture(persistenceHarness, unitFixture)
    let softDeletedCommentId = ''

    await systemWiring.createSoftDeleteCommentUseCaseWithValidation().execute({
      deleteCommentInput: {
        commentId: comment.id.value,
        deletingUserId: unitFixture.sampleUserId,
        authorId: unitFixture.sampleUserId
      },
      commentSoftDeleted: (softDeletedComment) => {
        softDeletedCommentId = softDeletedComment.id
      }
    })

    expect(softDeletedCommentId).toBe(comment.id.value)

    const loaded = await systemWiring.commentReadRepository.getById(comment.id)
    expect(loaded.isDeleted).toBe(true)
    expect(loaded.body).toBeNull()

    const outbox = await systemWiring.persistenceHarness.findOutboxEventsForAggregate(comment.id.value)
    expect(outbox.some((event) => event.eventType === CommentEventTypes.CommentSoftDeleted)).toBe(true)
  })
})
