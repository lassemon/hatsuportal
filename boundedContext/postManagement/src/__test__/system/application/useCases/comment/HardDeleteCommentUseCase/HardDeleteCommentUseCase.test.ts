import { describe, expect, it } from 'vitest'
import { CommentEventTypes } from '../../../../../../domain/events/CommentEvents'
import { seedCommentFixture } from '../../../../../support/fixtures/commentFixture'
import { persistenceHarness } from '../../../../../setup.db'
import { systemWiring } from '../../../../../setup.system'

describe('HardDeleteCommentUseCase (system)', () => {
  it('hard deletes a soft-deleted comment and persists domain event to outbox', async ({ unitFixture }) => {
    const { comment } = await seedCommentFixture(persistenceHarness, unitFixture)
    let hardDeletedCommentId = ''

    await systemWiring.createSoftDeleteCommentUseCaseWithValidation().execute({
      deleteCommentInput: {
        commentId: comment.id.value,
        deletingUserId: unitFixture.sampleUserId,
        authorId: unitFixture.sampleUserId
      },
      commentSoftDeleted: () => {}
    })

    const outboxAfterSoftDelete = await systemWiring.persistenceHarness.findOutboxEventsForAggregate(comment.id.value)
    expect(outboxAfterSoftDelete.some((event) => event.eventType === CommentEventTypes.CommentSoftDeleted)).toBe(true)

    await systemWiring.createHardDeleteCommentUseCaseWithValidation().execute({
      deleteCommentInput: {
        commentId: comment.id.value,
        deletingUserId: unitFixture.sampleUserId,
        authorId: unitFixture.sampleUserId
      },
      commentHardDeleted: (hardDeletedComment) => {
        hardDeletedCommentId = hardDeletedComment.id
      }
    })

    expect(hardDeletedCommentId).toBe(comment.id.value)

    const loaded = await systemWiring.commentReadRepository.getById(comment.id)
    expect(loaded).toBeNull()
  })
})
