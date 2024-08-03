import { describe, it, expect, vi, afterEach } from 'vitest'
import { NotFoundError } from '@hatsuportal/platform'
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
      .thenCommentLookupServiceCalledTimes('invalidateById', 1)
      .thenCommentLookupServiceCalledTimes('getById', 1)
  })

  it('should not call output boundary when domain event service fails after successful soft delete', async ({ unitFixture }) => {
    const scenario = await SoftDeleteCommentScenario.given()
      .withExistingComment()
      .domainEventServiceWillReject(new unitFixture.TestError('Domain event service failure'))
      .expectErrorOfType(unitFixture.TestError)
      .whenExecutedWithInput(baseInput(unitFixture))

    scenario.thenOutputBoundaryNotCalled('commentSoftDeleted')
  })

  it('should be idempotent when comment is already deleted', async ({ unitFixture }) => {
    const scenario = await SoftDeleteCommentScenario.given()
      .withDeletedComment()
      .whenExecutedWithInput(baseInput(unitFixture))

    scenario
      .thenOutputBoundaryNotCalled('commentSoftDeleted')
      .thenDomainEventsNotPersisted([expect.any(CommentSoftDeletedEvent)])
      .thenCommentLookupServiceCalledTimes('invalidateById', 0)
  })

  it('should not call output boundary when comment does not exist', async ({ unitFixture }) => {
    const scenario = await SoftDeleteCommentScenario.given()
      .withoutExistingComment()
      .expectErrorOfType(NotFoundError)
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

  it('should not call output boundary when lookup fails after successful soft delete', async ({ unitFixture }) => {
    const scenario = await SoftDeleteCommentScenario.given()
      .withExistingComment()
      .withoutExistingCommentInLookupService()
      .expectErrorOfType(NotFoundError)
      .whenExecutedWithInput(baseInput(unitFixture))

    scenario
      .thenOutputBoundaryNotCalled('commentSoftDeleted')
      .thenWriteRepositoryCalledTimes('softDelete', 1)
      .thenCommentLookupServiceCalledTimes('invalidateById', 1)
  })
})
