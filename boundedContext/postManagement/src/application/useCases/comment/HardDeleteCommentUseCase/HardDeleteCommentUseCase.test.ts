import { describe, it, expect, vi, afterEach } from 'vitest'
import { HardDeleteCommentScenario } from '../../../../__test__/support/comment/HardDeleteCommentScenario'
import { CommentDeletedEvent } from '../../../../domain'
import { IHardDeleteCommentUseCaseOptions } from '../HardDeleteCommentUseCase'

describe('HardDeleteCommentUseCase', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  const baseInput = (unitFixture: typeof import('../../../../__test__/testFactory')): IHardDeleteCommentUseCaseOptions => ({
    deleteCommentInput: {
      commentId: unitFixture.sampleCommentId,
      authorId: unitFixture.sampleUserId,
      deletingUserId: unitFixture.sampleUserId
    },
    commentHardDeleted: vi.fn()
  })

  it('should hard delete a comment successfully and persist expected domain events', async ({ unitFixture }) => {
    const scenario = await HardDeleteCommentScenario.given()
      .withExistingComment()
      .withCommentWithRelations()
      .whenExecutedWithInput(baseInput(unitFixture))

    scenario
      .thenOutputBoundaryCalled('commentHardDeleted', expect.any(Object))
      .thenDomainEventsPersisted([expect.any(CommentDeletedEvent)])
  })

  it('should not call output boundary when comment does not exist in lookup service', async ({ unitFixture }) => {
    const scenario = await HardDeleteCommentScenario.given()
      .withoutExistingComment()
      .expectErrorOfType(Error)
      .whenExecutedWithInput(baseInput(unitFixture))

    scenario.thenOutputBoundaryNotCalled('commentHardDeleted').thenDomainEventsNotPersisted([expect.any(CommentDeletedEvent)])
  })

  it('should not call output boundary or persist domain events when repository fails', async ({ unitFixture }) => {
    const scenario = await HardDeleteCommentScenario.given()
      .withExistingComment()
      .withCommentWithRelations()
      .writeRepositoryWillReject('deletePermanently', new unitFixture.TestError('Repository failed'))
      .expectErrorOfType(unitFixture.TestError)
      .whenExecutedWithInput(baseInput(unitFixture))

    scenario.thenOutputBoundaryNotCalled('commentHardDeleted').thenDomainEventsNotPersisted([expect.any(CommentDeletedEvent)])
  })
})
