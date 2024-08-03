import { describe, it, vi, afterEach } from 'vitest'
import { OrderEnum } from '@hatsuportal/common'
import { InvalidInputError } from '@hatsuportal/platform'
import { NonNegativeInteger } from '@hatsuportal/shared-kernel'
import { GetCommentsValidationScenario } from '../../../../__test__/support/comment/GetCommentsValidationScenario'
import { CommentCursor } from '../../../../domain'
import { IGetCommentsUseCaseOptions } from '../GetCommentsUseCase'

describe('GetCommentsUseCaseWithValidation', () => {
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

  it('should execute underlying use case when validations pass', async ({ unitFixture }) => {
    const scenario = await GetCommentsValidationScenario.given().whenExecutedWithInput(baseInput(unitFixture))

    scenario.thenUnderlyingUseCaseExecuted(scenario.useCaseMock)
  })

  it('should throw InvalidInputError when postId is invalid', async ({ unitFixture }) => {
    const scenario = await GetCommentsValidationScenario.given()
      .expectErrorOfType(InvalidInputError)
      .whenExecutedWithInput({
        ...baseInput(unitFixture),
        getCommentsInput: {
          ...baseInput(unitFixture).getCommentsInput,
          postId: 'invalid-id'
        }
      })

    scenario.thenUnderlyingUseCaseNotExecuted(scenario.useCaseMock)
  })

  it('should throw InvalidInputError when limit is negative', async ({ unitFixture }) => {
    const scenario = await GetCommentsValidationScenario.given()
      .expectErrorOfType(InvalidInputError)
      .whenExecutedWithInput({
        ...baseInput(unitFixture),
        getCommentsInput: {
          ...baseInput(unitFixture).getCommentsInput,
          limit: -1
        }
      })

    scenario.thenUnderlyingUseCaseNotExecuted(scenario.useCaseMock)
  })

  it('should throw InvalidInputError when sort is invalid', async ({ unitFixture }) => {
    const scenario = await GetCommentsValidationScenario.given()
      .expectErrorOfType(InvalidInputError)
      .whenExecutedWithInput({
        ...baseInput(unitFixture),
        getCommentsInput: {
          ...baseInput(unitFixture).getCommentsInput,
          sort: 'invalid_sort' as OrderEnum
        }
      })

    scenario.thenUnderlyingUseCaseNotExecuted(scenario.useCaseMock)
  })

  it('should execute underlying use case when cursor is valid', async ({ unitFixture }) => {
    const cursor = CommentCursor.toCursor({
      parentId: null,
      createdAt: unitFixture.commentDTOMock().createdAt,
      id: unitFixture.sampleCommentId
    })

    const scenario = await GetCommentsValidationScenario.given().whenExecutedWithInput({
      ...baseInput(unitFixture),
      getCommentsInput: {
        ...baseInput(unitFixture).getCommentsInput,
        cursor
      }
    })

    scenario.thenUnderlyingUseCaseExecuted(scenario.useCaseMock)
  })
})
