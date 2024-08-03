import { describe, it, expect, vi, afterEach } from 'vitest'
import { SoftDeleteCommentScenario } from '../../../../__test__/support/comment/SoftDeleteCommentScenario'
import { CommentSoftDeletedEvent } from '../../../../domain'
import { ISoftDeleteCommentUseCaseOptions } from '../SoftDeleteCommentUseCase'

describe('SoftDeleteCommentUseCase', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  const baseInput = (unitFixture: typeof import('../../../../__test__/testFactory')): ISoftDeleteCommentUseCaseOptions => ({
    deleteCommentInput: {
      commentId: unitFixture.sampleCommentId,
      authorId: unitFixture.sampleUserId,
      deletingUserId: unitFixture.sampleUserId
    },
    commentSoftDeleted: vi.fn()
  })

  it('should soft delete a comment successfully and persist expected domain events', async ({ unitFixture }) => {
    const scenario = await SoftDeleteCommentScenario.given()
      .withExistingComment()
      .whenExecutedWithInput(baseInput(unitFixture))

    scenario
      .thenOutputBoundaryCalled('commentSoftDeleted', expect.any(Object))
      .thenDomainEventsPersisted([expect.any(CommentSoftDeletedEvent)])
  })

  it('should be idempotent when comment is already deleted', async ({ unitFixture }) => {
    const scenario = await SoftDeleteCommentScenario.given()
      .withDeletedComment()
      .whenExecutedWithInput(baseInput(unitFixture))

    scenario
      .thenOutputBoundaryNotCalled('commentSoftDeleted')
      .thenDomainEventsNotPersisted([expect.any(CommentSoftDeletedEvent)])
  })

  it('should not call output boundary when comment does not exist', async ({ unitFixture }) => {
    const scenario = await SoftDeleteCommentScenario.given()
      .withoutExistingComment()
      .expectErrorOfType(Error)
      .whenExecutedWithInput(baseInput(unitFixture))

    scenario.thenOutputBoundaryNotCalled('commentSoftDeleted').thenDomainEventsNotPersisted([expect.any(CommentSoftDeletedEvent)])
  })

  it('should not call output boundary or persist domain events when repository fails', async ({ unitFixture }) => {
    const scenario = await SoftDeleteCommentScenario.given()
      .withExistingComment()
      .writeRepositoryWillReject('softDelete', new unitFixture.TestError('Repository failed'))
      .expectErrorOfType(unitFixture.TestError)
      .whenExecutedWithInput(baseInput(unitFixture))

    scenario.thenOutputBoundaryNotCalled('commentSoftDeleted').thenDomainEventsNotPersisted([expect.any(CommentSoftDeletedEvent)])
  })
})
