import { describe, it, vi, afterEach } from 'vitest'
import { AuthorizationError, InvalidInputError, NotFoundError } from '@hatsuportal/platform'
import { EditCommentValidationScenario } from '../../../../__test__/support/comment/EditCommentValidationScenario'
import { IEditCommentUseCaseOptions } from '../EditCommentUseCase'

describe('EditCommentUseCaseWithValidation', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  const baseInput = (unitFixture: typeof import('../../../../__test__/testFactory')): IEditCommentUseCaseOptions => ({
    editCommentInput: {
      commentId: unitFixture.sampleCommentId,
      body: 'Updated comment body.',
      authorId: unitFixture.sampleUserId
    },
    commentEdited: vi.fn()
  })

  it('should successfully execute edit comment use case when all validations pass', async ({ unitFixture }) => {
    const scenario = await EditCommentValidationScenario.given()
      .withLoggedInUser()
      .withExistingComment()
      .whenExecutedWithInput(baseInput(unitFixture))

    scenario.thenUnderlyingUseCaseExecuted(scenario.useCaseMock)
  })

  it('should throw AuthorizationError if loggedInUser does not exist', async ({ unitFixture }) => {
    const scenario = await EditCommentValidationScenario.given()
      .withoutLoggedInUser()
      .withExistingComment()
      .expectErrorOfType(AuthorizationError)
      .whenExecutedWithInput(baseInput(unitFixture))

    scenario.thenUnderlyingUseCaseNotExecuted(scenario.useCaseMock)
  })

  it('should throw NotFoundError if comment does not exist', async ({ unitFixture }) => {
    const scenario = await EditCommentValidationScenario.given()
      .withLoggedInUser()
      .withoutExistingComment()
      .expectErrorOfType(NotFoundError)
      .whenExecutedWithInput(baseInput(unitFixture))

    scenario.thenUnderlyingUseCaseNotExecuted(scenario.useCaseMock)
  })

  it('should throw AuthorizationError if user is not allowed to edit comment', async ({ unitFixture }) => {
    const scenario = await EditCommentValidationScenario.given()
      .withLoggedInUser()
      .withExistingComment()
      .authorizationWillFail('Forbidden')
      .expectErrorOfType(AuthorizationError)
      .whenExecutedWithInput(baseInput(unitFixture))

    scenario.thenUnderlyingUseCaseNotExecuted(scenario.useCaseMock)
  })

  it('denies edit by non-author via real ABAC', async ({ unitFixture }) => {
    const scenario = await EditCommentValidationScenario.given()
      .withNonAuthorUser()
      .withExistingComment()
      .withActualAuthorizationService()
      .expectErrorOfType(AuthorizationError)
      .whenExecutedWithInput({
        ...baseInput(unitFixture),
        editCommentInput: {
          ...baseInput(unitFixture).editCommentInput,
          authorId: unitFixture.sampleNonAuthorUserId
        }
      })

    scenario.thenUnderlyingUseCaseNotExecuted(scenario.useCaseMock)
  })

  it('denies edit of deleted comment via real ABAC', async ({ unitFixture }) => {
    const scenario = await EditCommentValidationScenario.given()
      .withLoggedInUser()
      .withDeletedComment()
      .withActualAuthorizationService()
      .expectErrorOfType(AuthorizationError)
      .whenExecutedWithInput(baseInput(unitFixture))

    scenario.thenUnderlyingUseCaseNotExecuted(scenario.useCaseMock)
  })

  it('allows edit by author via real ABAC', async ({ unitFixture }) => {
    const scenario = await EditCommentValidationScenario.given()
      .withLoggedInUser()
      .withExistingComment()
      .withActualAuthorizationService()
      .whenExecutedWithInput(baseInput(unitFixture))

    scenario.thenUnderlyingUseCaseExecuted(scenario.useCaseMock)
  })

  it('should throw InvalidInputError when commentId is invalid', async ({ unitFixture }) => {
    const scenario = await EditCommentValidationScenario.given()
      .withLoggedInUser()
      .withExistingComment()
      .expectErrorOfType(InvalidInputError)
      .whenExecutedWithInput({
        ...baseInput(unitFixture),
        editCommentInput: {
          ...baseInput(unitFixture).editCommentInput,
          commentId: 'invalid-id'
        }
      })

    scenario.thenUnderlyingUseCaseNotExecuted(scenario.useCaseMock)
  })
})
