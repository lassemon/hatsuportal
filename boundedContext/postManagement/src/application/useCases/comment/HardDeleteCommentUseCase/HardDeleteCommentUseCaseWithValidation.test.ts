import { describe, it, vi, afterEach } from 'vitest'
import { UserRoleEnum } from '@hatsuportal/common'
import { AuthorizationError, InvalidInputError, NotFoundError } from '@hatsuportal/platform'
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

  it('should throw AuthorizationError if loggedInUser does not exist', async ({ unitFixture }) => {
    const scenario = await HardDeleteCommentValidationScenario.given()
      .withoutLoggedInUser()
      .withExistingComment()
      .expectErrorOfType(AuthorizationError)
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

  it('denies hard delete of non-deleted comment by admin via real ABAC', async ({ unitFixture }) => {
    const scenario = await HardDeleteCommentValidationScenario.given()
      .withAdminUser()
      .withExistingComment()
      .withActualAuthorizationService()
      .expectErrorOfType(AuthorizationError)
      .whenExecutedWithInput(baseInput(unitFixture))

    scenario.thenUnderlyingUseCaseNotExecuted(scenario.useCaseMock)
  })

  it('allows hard delete of non-deleted comment by super admin via real ABAC', async ({ unitFixture }) => {
    const scenario = await HardDeleteCommentValidationScenario.given()
      .withLoggedInUser(unitFixture.userReadModelDTOMock({ roles: [UserRoleEnum.SuperAdmin] }))
      .withExistingComment()
      .withActualAuthorizationService()
      .whenExecutedWithInput(baseInput(unitFixture))

    scenario.thenUnderlyingUseCaseExecuted(scenario.useCaseMock)
  })

  it('allows hard delete of soft-deleted comment by author via real ABAC', async ({ unitFixture }) => {
    const scenario = await HardDeleteCommentValidationScenario.given()
      .withLoggedInUser()
      .withDeletedComment()
      .withActualAuthorizationService()
      .whenExecutedWithInput(baseInput(unitFixture))

    scenario.thenUnderlyingUseCaseExecuted(scenario.useCaseMock)
  })

  it('allows hard delete of soft-deleted comment by admin via real ABAC', async ({ unitFixture }) => {
    const scenario = await HardDeleteCommentValidationScenario.given()
      .withAdminUser()
      .withDeletedComment(unitFixture.commentMock({ authorId: unitFixture.commentMock().authorId, isDeleted: true, body: null }))
      .withActualAuthorizationService()
      .whenExecutedWithInput(baseInput(unitFixture))

    scenario.thenUnderlyingUseCaseExecuted(scenario.useCaseMock)
  })

  it('denies hard delete by non-author viewer via real ABAC', async ({ unitFixture }) => {
    const scenario = await HardDeleteCommentValidationScenario.given()
      .withNonAuthorUser(unitFixture.userReadModelDTOMock({ id: unitFixture.sampleNonAuthorUserId, roles: [UserRoleEnum.Viewer] }))
      .withDeletedComment()
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
