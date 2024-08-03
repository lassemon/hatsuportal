import { describe, it, expect, vi, afterEach } from 'vitest'
import { OrderEnum } from '@hatsuportal/common'
import { GetRepliesScenario } from '../../../../__test__/support/comment/GetRepliesScenario'
import { CommentCursor } from '../../../../domain'
import { IGetRepliesUseCaseOptions } from '../GetRepliesUseCase'

describe('GetRepliesUseCase', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  const baseInput = (unitFixture: typeof import('../../../../__test__/testFactory')): IGetRepliesUseCaseOptions => ({
    defaultRepliesSortOrder: OrderEnum.Ascending,
    getRepliesInput: {
      parentCommentId: unitFixture.sampleCommentId,
      limit: 10
    },
    repliesFound: vi.fn()
  })

  it('should return replies via output boundary', async ({ unitFixture }) => {
    const scenario = await GetRepliesScenario.given().whenExecutedWithInput(baseInput(unitFixture))

    scenario.thenOutputBoundaryCalled('repliesFound', expect.any(Object))
  })

  it('should propagate lookup service failures', async ({ unitFixture }) => {
    const scenario = await GetRepliesScenario.given()
      .lookupServiceWillReject('listReplies', new unitFixture.TestError('Lookup failed'))
      .expectErrorOfType(unitFixture.TestError)
      .whenExecutedWithInput(baseInput(unitFixture))

    scenario.thenOutputBoundaryNotCalled('repliesFound')
  })

  it('should return an empty page when no replies exist', async ({ unitFixture }) => {
    const scenario = await GetRepliesScenario.given().withEmptyRepliesList().whenExecutedWithInput(baseInput(unitFixture))

    scenario.thenOutputBoundaryCalled('repliesFound', { replies: [], nextCursor: null })
  })

  it('should return the last page of replies without suggesting further pages', async ({ unitFixture }) => {
    const cursor = CommentCursor.toCursor({
      parentId: unitFixture.sampleCommentId,
      createdAt: unitFixture.commentDTOMock().createdAt,
      id: unitFixture.sampleCommentId
    })

    const scenario = await GetRepliesScenario.given()
      .withExhaustedRepliesList()
      .whenExecutedWithInput({
        ...baseInput(unitFixture),
        getRepliesInput: {
          ...baseInput(unitFixture).getRepliesInput,
          cursor
        }
      })

    scenario.thenOutputBoundaryCalled('repliesFound', expect.objectContaining({ nextCursor: null }))
  })
})
