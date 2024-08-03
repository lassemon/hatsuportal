import { describe, it, vi, afterEach } from 'vitest'
import { OrderEnum } from '@hatsuportal/common'
import { InvalidInputError } from '@hatsuportal/platform'
import { GetRepliesValidationScenario } from '../../../../__test__/support/comment/GetRepliesValidationScenario'
import { CommentCursor } from '../../../../domain'
import { IGetRepliesUseCaseOptions } from '../GetRepliesUseCase'

describe('GetRepliesUseCaseWithValidation', () => {
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

  it('should execute underlying use case when validations pass', async ({ unitFixture }) => {
    const scenario = await GetRepliesValidationScenario.given().whenExecutedWithInput(baseInput(unitFixture))

    scenario.thenUnderlyingUseCaseExecuted(scenario.useCaseMock)
  })

  it('should throw InvalidInputError when parentCommentId is invalid', async ({ unitFixture }) => {
    const scenario = await GetRepliesValidationScenario.given()
      .expectErrorOfType(InvalidInputError)
      .whenExecutedWithInput({
        ...baseInput(unitFixture),
        getRepliesInput: {
          ...baseInput(unitFixture).getRepliesInput,
          parentCommentId: 'invalid-id'
        }
      })

    scenario.thenUnderlyingUseCaseNotExecuted(scenario.useCaseMock)
  })

  it('should throw InvalidInputError when limit is negative', async ({ unitFixture }) => {
    const scenario = await GetRepliesValidationScenario.given()
      .expectErrorOfType(InvalidInputError)
      .whenExecutedWithInput({
        ...baseInput(unitFixture),
        getRepliesInput: {
          ...baseInput(unitFixture).getRepliesInput,
          limit: -1
        }
      })

    scenario.thenUnderlyingUseCaseNotExecuted(scenario.useCaseMock)
  })

  it('should execute underlying use case when cursor is valid', async ({ unitFixture }) => {
    const cursor = CommentCursor.toCursor({
      parentId: unitFixture.sampleCommentId,
      createdAt: unitFixture.commentDTOMock().createdAt,
      id: unitFixture.sampleCommentId
    })

    const scenario = await GetRepliesValidationScenario.given().whenExecutedWithInput({
      ...baseInput(unitFixture),
      getRepliesInput: {
        ...baseInput(unitFixture).getRepliesInput,
        cursor
      }
    })

    scenario.thenUnderlyingUseCaseExecuted(scenario.useCaseMock)
  })
})
