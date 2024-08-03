import { describe, it, expect, vi, afterEach } from 'vitest'
import { OrderEnum } from '@hatsuportal/common'
import { NonNegativeInteger } from '@hatsuportal/shared-kernel'
import { GetCommentsScenario } from '../../../../__test__/support/comment/GetCommentsScenario'
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
})
