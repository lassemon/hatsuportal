import { describe, it, expect, vi, afterEach } from 'vitest'
import { NotFoundError } from '@hatsuportal/platform'
import { EditCommentScenario } from '../../../../__test__/support/comment/EditCommentScenario'
import { CommentUpdatedEvent } from '../../../../domain'
import { IEditCommentUseCaseOptions } from '../EditCommentUseCase'

describe('EditCommentUseCase', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  const baseInput = (unitFixture: typeof import('../../../../__test__/testFactory')): IEditCommentUseCaseOptions => ({
    editCommentInput: {
      commentId: unitFixture.sampleCommentId,
      body: 'Updated comment body.',
      authorId: unitFixture.sampleUserId
    },
    commentEdited: vi.fn()
  })

  it('should edit a comment successfully and persist expected domain events', async ({ unitFixture }) => {
    const scenario = await EditCommentScenario.given()
      .withExistingComment()
      .whenExecutedWithInput(baseInput(unitFixture))

    scenario
      .thenOutputBoundaryCalled('commentEdited', expect.any(Object))
      .thenDomainEventsPersisted([expect.any(CommentUpdatedEvent)])
      .thenCommentLookupServiceCalledTimes('invalidateById', 1)
      .thenCommentLookupServiceCalledTimes('getById', 1)
  })

  it('should not call output boundary when domain event service fails after successful update', async ({ unitFixture }) => {
    const scenario = await EditCommentScenario.given()
      .withExistingComment()
      .domainEventServiceWillReject(new unitFixture.TestError('Domain event service failure'))
      .expectErrorOfType(unitFixture.TestError)
      .whenExecutedWithInput(baseInput(unitFixture))

    scenario.thenOutputBoundaryNotCalled('commentEdited')
  })

  it('should not call output boundary when comment does not exist', async ({ unitFixture }) => {
    const scenario = await EditCommentScenario.given()
      .withoutExistingComment()
      .expectErrorOfType(NotFoundError)
      .whenExecutedWithInput(baseInput(unitFixture))

    scenario.thenOutputBoundaryNotCalled('commentEdited').thenDomainEventsNotPersisted([expect.any(CommentUpdatedEvent)])
  })

  it('should not call output boundary or persist domain events when repository fails', async ({ unitFixture }) => {
    const scenario = await EditCommentScenario.given()
      .withExistingComment()
      .writeRepositoryWillReject('update', new unitFixture.TestError('Repository failed'))
      .expectErrorOfType(unitFixture.TestError)
      .whenExecutedWithInput(baseInput(unitFixture))

    scenario.thenOutputBoundaryNotCalled('commentEdited').thenDomainEventsNotPersisted([expect.any(CommentUpdatedEvent)])
  })

  it('should not call output boundary when lookup fails after successful update', async ({ unitFixture }) => {
    const scenario = await EditCommentScenario.given()
      .withExistingComment()
      .withoutExistingCommentInLookupService()
      .expectErrorOfType(NotFoundError)
      .whenExecutedWithInput(baseInput(unitFixture))

    scenario
      .thenOutputBoundaryNotCalled('commentEdited')
      .thenWriteRepositoryCalledTimes('update', 1)
      .thenCommentLookupServiceCalledTimes('invalidateById', 1)
  })
})
