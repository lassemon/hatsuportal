import { describe, it, expect, vi, afterEach } from 'vitest'
import { NotFoundError } from '@hatsuportal/platform'
import { AddCommentTargetKind } from '../../../dtos'
import { AddCommentScenario } from '../../../../__test__/support/comment/AddCommentScenario'
import { CommentCreatedEvent } from '../../../../domain'
import { IAddCommentUseCaseOptions } from '../AddCommentUseCase'

describe('AddCommentUseCase', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  const baseInput = (unitFixture: typeof import('../../../../__test__/testFactory'), overrides: Partial<IAddCommentUseCaseOptions['addCommentInput']> = {}): IAddCommentUseCaseOptions => ({
    addCommentInput: {
      postId: unitFixture.sampleStoryId,
      body: 'A new comment.',
      authorId: unitFixture.sampleUserId,
      target: { kind: AddCommentTargetKind.TopLevel, postId: unitFixture.sampleStoryId },
      ...overrides
    },
    commentCreated: vi.fn()
  })

  it('should create a comment successfully and persist expected domain events', async ({ unitFixture }) => {
    const scenario = await AddCommentScenario.given().whenExecutedWithInput(baseInput(unitFixture))

    scenario
      .thenOutputBoundaryCalled('commentCreated', expect.any(Object))
      .thenDomainEventsPersisted([expect.any(CommentCreatedEvent)])
      .thenCommentLookupServiceCalledTimes('invalidateById', 0)
  })

  it('should not call output boundary when domain event service fails after successful insert', async ({ unitFixture }) => {
    const scenario = await AddCommentScenario.given()
      .domainEventServiceWillReject(new unitFixture.TestError('Domain event service failure'))
      .expectErrorOfType(unitFixture.TestError)
      .whenExecutedWithInput(baseInput(unitFixture))

    scenario.thenOutputBoundaryNotCalled('commentCreated')
  })

  it('should not call output boundary or persist domain events when repository fails', async ({ unitFixture }) => {
    const scenario = await AddCommentScenario.given()
      .writeRepositoryWillReject('insert', new unitFixture.TestError('Repository failed'))
      .expectErrorOfType(unitFixture.TestError)
      .whenExecutedWithInput(baseInput(unitFixture))

    scenario.thenOutputBoundaryNotCalled('commentCreated').thenDomainEventsNotPersisted([expect.any(CommentCreatedEvent)])
  })

  it('throws NotFoundError when comment is missing from lookup after create', async ({ unitFixture }) => {
    const scenario = await AddCommentScenario.given()
      .withoutExistingComment()
      .expectErrorOfType(NotFoundError)
      .whenExecutedWithInput(baseInput(unitFixture))

    scenario
      .thenOutputBoundaryNotCalled('commentCreated')
      .thenDomainEventsPersisted([expect.any(CommentCreatedEvent)])
      .thenWriteRepositoryCalledTimes('insert', 1)
  })
})
