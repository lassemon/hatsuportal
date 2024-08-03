import { describe, expect, it } from 'vitest'
import { CommentEventTypes } from '../../../../../../domain/events/CommentEvents'
import { seedCommentFixture } from '../../../../../support/fixtures/commentFixture'
import { persistenceHarness } from '../../../../../setup.db'
import { systemWiring } from '../../../../../setup.system'

describe('EditCommentUseCase (system)', () => {
  it('edits a comment and persists domain event to outbox', async ({ unitFixture }) => {
    const { comment } = await seedCommentFixture(persistenceHarness, unitFixture)
    const updatedBody = 'Edited system test comment'
    let editedCommentId = ''

    await systemWiring.createEditCommentUseCaseWithValidation().execute({
      editCommentInput: {
        commentId: comment.id.value,
        body: updatedBody,
        authorId: unitFixture.sampleUserId
      },
      commentEdited: (editedComment) => {
        editedCommentId = editedComment.id
      }
    })

    expect(editedCommentId).toBe(comment.id.value)

    const loaded = await systemWiring.commentReadRepository.getById(comment.id)
    expect(loaded.body).toBe(updatedBody)

    const outbox = await systemWiring.persistenceHarness.findOutboxEventsForAggregate(comment.id.value)
    expect(outbox.some((event) => event.eventType === CommentEventTypes.CommentUpdated)).toBe(true)
  })
})
