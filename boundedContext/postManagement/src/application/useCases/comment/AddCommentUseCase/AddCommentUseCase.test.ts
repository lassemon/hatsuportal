import { describe, it, expect, vi, afterEach } from 'vitest'
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
  })

  it('should not call output boundary or persist domain events when repository fails', async ({ unitFixture }) => {
    const scenario = await AddCommentScenario.given()
      .writeRepositoryWillReject('insert', new unitFixture.TestError('Repository failed'))
      .expectErrorOfType(unitFixture.TestError)
      .whenExecutedWithInput(baseInput(unitFixture))

    scenario.thenOutputBoundaryNotCalled('commentCreated').thenDomainEventsNotPersisted([expect.any(CommentCreatedEvent)])
  })

  it('should not call output boundary when lookup service returns null after insert', async ({ unitFixture }) => {
    const scenario = await AddCommentScenario.given()
      .withoutExistingComment()
      .expectErrorOfType(Error)
      .whenExecutedWithInput(baseInput(unitFixture))

    scenario.thenOutputBoundaryNotCalled('commentCreated').thenDomainEventsNotPersisted([expect.any(CommentCreatedEvent)])
  })
})
