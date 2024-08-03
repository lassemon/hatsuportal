import { describe, it, vi, afterEach } from 'vitest'
import { AuthorizationError, InvalidInputError, NotFoundError } from '@hatsuportal/platform'
import { SoftDeleteCommentValidationScenario } from '../../../../__test__/support/comment/SoftDeleteCommentValidationScenario'
import { ISoftDeleteCommentUseCaseOptions } from '../SoftDeleteCommentUseCase'

describe('SoftDeleteCommentUseCaseWithValidation', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  const baseInput = (unitFixture: typeof import('../../../../__test__/testFactory')): ISoftDeleteCommentUseCaseOptions => ({
    deleteCommentInput: {
      commentId: unitFixture.sampleCommentId,
      authorId: unitFixture.sampleUserId,
      deletingUserId: unitFixture.sampleUserId
    },
    commentSoftDeleted: vi.fn()
  })

  it('should successfully execute soft delete comment use case when all validations pass', async ({ unitFixture }) => {
    const scenario = await SoftDeleteCommentValidationScenario.given()
      .withLoggedInUser()
      .withExistingComment()
      .whenExecutedWithInput(baseInput(unitFixture))

    scenario.thenUnderlyingUseCaseExecuted(scenario.useCaseMock)
  })

  it('should throw AuthorizationError if loggedInUser does not exist', async ({ unitFixture }) => {
    const scenario = await SoftDeleteCommentValidationScenario.given()
      .withoutLoggedInUser()
      .withExistingComment()
      .expectErrorOfType(AuthorizationError)
      .whenExecutedWithInput(baseInput(unitFixture))

    scenario.thenUnderlyingUseCaseNotExecuted(scenario.useCaseMock)
  })

  it('should throw NotFoundError if comment does not exist', async ({ unitFixture }) => {
    const scenario = await SoftDeleteCommentValidationScenario.given()
      .withLoggedInUser()
      .withoutExistingComment()
      .expectErrorOfType(NotFoundError)
      .whenExecutedWithInput(baseInput(unitFixture))

    scenario.thenUnderlyingUseCaseNotExecuted(scenario.useCaseMock)
  })

  it('should throw AuthorizationError if user is not allowed to soft delete comment', async ({ unitFixture }) => {
    const scenario = await SoftDeleteCommentValidationScenario.given()
      .withLoggedInUser()
      .withExistingComment()
      .authorizationWillFail('Forbidden')
      .expectErrorOfType(AuthorizationError)
      .whenExecutedWithInput(baseInput(unitFixture))

    scenario.thenUnderlyingUseCaseNotExecuted(scenario.useCaseMock)
  })

  it('denies soft delete by non-author via real ABAC', async ({ unitFixture }) => {
    const scenario = await SoftDeleteCommentValidationScenario.given()
      .withNonAuthorUser()
      .withExistingComment()
      .withActualAuthorizationService()
      .expectErrorOfType(AuthorizationError)
      .whenExecutedWithInput({
        ...baseInput(unitFixture),
        deleteCommentInput: {
          ...baseInput(unitFixture).deleteCommentInput,
          authorId: unitFixture.sampleNonAuthorUserId,
          deletingUserId: unitFixture.sampleNonAuthorUserId
        }
      })

    scenario.thenUnderlyingUseCaseNotExecuted(scenario.useCaseMock)
  })

  it('allows idempotent soft delete for inactive user on already-deleted comment via real ABAC', async ({ unitFixture }) => {
    const scenario = await SoftDeleteCommentValidationScenario.given()
      .withInactiveUser()
      .withDeletedComment()
      .withActualAuthorizationService()
      .whenExecutedWithInput(baseInput(unitFixture))

    scenario.thenUnderlyingUseCaseExecuted(scenario.useCaseMock)
  })

  it('should throw InvalidInputError when commentId is invalid', async ({ unitFixture }) => {
    const scenario = await SoftDeleteCommentValidationScenario.given()
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
