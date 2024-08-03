import { describe, it, vi, afterEach } from 'vitest'
import { AuthenticationError, AuthorizationError, InvalidInputError, NotFoundError } from '@hatsuportal/platform'
import { HardDeleteCommentValidationScenario } from '../../../../__test__/support/comment/HardDeleteCommentValidationScenario'
import { IHardDeleteCommentUseCaseOptions } from '../HardDeleteCommentUseCase'

describe('HardDeleteCommentUseCaseWithValidation', () => {
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

  it('should successfully execute hard delete comment use case when all validations pass', async ({ unitFixture }) => {
    const scenario = await HardDeleteCommentValidationScenario.given()
      .withLoggedInUser()
      .withDeletedComment()
      .whenExecutedWithInput(baseInput(unitFixture))

    scenario.thenUnderlyingUseCaseExecuted(scenario.useCaseMock)
  })

  it('should throw AuthenticationError if loggedInUser does not exist', async ({ unitFixture }) => {
    const scenario = await HardDeleteCommentValidationScenario.given()
      .withoutLoggedInUser()
      .withExistingComment()
      .expectErrorOfType(AuthenticationError)
      .whenExecutedWithInput(baseInput(unitFixture))

    scenario.thenUnderlyingUseCaseNotExecuted(scenario.useCaseMock)
  })

  it('should throw NotFoundError if comment does not exist', async ({ unitFixture }) => {
    const scenario = await HardDeleteCommentValidationScenario.given()
      .withLoggedInUser()
      .withoutExistingComment()
      .expectErrorOfType(NotFoundError)
      .whenExecutedWithInput(baseInput(unitFixture))

    scenario.thenUnderlyingUseCaseNotExecuted(scenario.useCaseMock)
  })

  it('should throw AuthorizationError if user is not allowed to hard delete comment', async ({ unitFixture }) => {
    const scenario = await HardDeleteCommentValidationScenario.given()
      .withLoggedInUser()
      .withDeletedComment()
      .authorizationWillFail('Forbidden')
      .expectErrorOfType(AuthorizationError)
      .whenExecutedWithInput(baseInput(unitFixture))

    scenario.thenUnderlyingUseCaseNotExecuted(scenario.useCaseMock)
  })

  it('should throw InvalidInputError when commentId is invalid', async ({ unitFixture }) => {
    const scenario = await HardDeleteCommentValidationScenario.given()
      .withLoggedInUser()
      .withExistingComment()
      .expectErrorOfType(InvalidInputError)
      .whenExecutedWithInput({
        ...baseInput(unitFixture),
        deleteCommentInput: {
          ...baseInput(unitFixture).deleteCommentInput,
          commentId: 'invalid-id'
        }
      })

    scenario.thenUnderlyingUseCaseNotExecuted(scenario.useCaseMock)
  })
})
