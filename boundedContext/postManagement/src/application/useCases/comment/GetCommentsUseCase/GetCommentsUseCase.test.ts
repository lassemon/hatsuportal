import { describe, it, expect, vi, afterEach } from 'vitest'
import { OrderEnum } from '@hatsuportal/common'
import { NonNegativeInteger } from '@hatsuportal/shared-kernel'
import { GetCommentsScenario } from '../../../../__test__/support/comment/GetCommentsScenario'
import { CommentCursor } from '../../../../domain'
import { IGetCommentsUseCaseOptions } from '../GetCommentsUseCase'

describe('GetCommentsUseCase', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  const baseInput = (unitFixture: typeof import('../../../../__test__/testFactory')): IGetCommentsUseCaseOptions => ({
    defaultSortOrder: OrderEnum.Descending,
    defaultRepliesPreviewLimit: new NonNegativeInteger(3),
    getCommentsInput: {
      postId: unitFixture.sampleStoryId,
      limit: 10,
      sort: OrderEnum.Descending
    },
    commentsFound: vi.fn()
  })

  it('should return comments via output boundary', async ({ unitFixture }) => {
    const scenario = await GetCommentsScenario.given().whenExecutedWithInput(baseInput(unitFixture))

    scenario.thenOutputBoundaryCalled('commentsFound', expect.any(Object))
  })

  it('should propagate lookup service failures', async ({ unitFixture }) => {
    const scenario = await GetCommentsScenario.given()
      .lookupServiceWillReject('listTopLevelForPost', new unitFixture.TestError('Lookup failed'))
      .expectErrorOfType(unitFixture.TestError)
      .whenExecutedWithInput(baseInput(unitFixture))

    scenario.thenOutputBoundaryNotCalled('commentsFound')
  })

  it('should return an empty page when no comments exist', async ({ unitFixture }) => {
    const scenario = await GetCommentsScenario.given().withEmptyCommentList().whenExecutedWithInput(baseInput(unitFixture))

    scenario.thenOutputBoundaryCalled('commentsFound', { comments: [], nextCursor: null })
  })

  it('should return the last page of comments without suggesting further pages', async ({ unitFixture }) => {
    const cursor = CommentCursor.toCursor({
      parentId: null,
      createdAt: unitFixture.commentDTOMock().createdAt,
      id: unitFixture.sampleCommentId
    })

    const scenario = await GetCommentsScenario.given()
      .withExhaustedCommentList()
      .whenExecutedWithInput({
        ...baseInput(unitFixture),
        getCommentsInput: {
          ...baseInput(unitFixture).getCommentsInput,
          cursor
        }
      })

    scenario.thenOutputBoundaryCalled('commentsFound', expect.objectContaining({ nextCursor: null }))
  })
})
