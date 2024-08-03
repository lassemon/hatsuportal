import { InputLimits } from '@hatsuportal/contracts'
import { describe, it, vi, afterEach } from 'vitest'
import { AuthenticationError, AuthorizationError, InvalidInputError, NotFoundError } from '@hatsuportal/platform'
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

  it('should throw AuthenticationError if loggedInUser does not exist', async ({ unitFixture }) => {
    const scenario = await EditCommentValidationScenario.given()
      .withoutLoggedInUser()
      .withExistingComment()
      .expectErrorOfType(AuthenticationError)
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

  it('should throw InvalidInputError when body is empty', async ({ unitFixture }) => {
    const scenario = await EditCommentValidationScenario.given()
      .withLoggedInUser()
      .withExistingComment()
      .expectErrorOfType(InvalidInputError)
      .whenExecutedWithInput({
        ...baseInput(unitFixture),
        editCommentInput: {
          ...baseInput(unitFixture).editCommentInput,
          body: '   '
        }
      })

    scenario.thenUnderlyingUseCaseNotExecuted(scenario.useCaseMock)
  })

  it('should throw InvalidInputError when body exceeds limit', async ({ unitFixture }) => {
    const scenario = await EditCommentValidationScenario.given()
      .withLoggedInUser()
      .withExistingComment()
      .expectErrorOfType(InvalidInputError)
      .whenExecutedWithInput({
        ...baseInput(unitFixture),
        editCommentInput: {
          ...baseInput(unitFixture).editCommentInput,
          body: 'x'.repeat(InputLimits.commentBody + 1)
        }
      })

    scenario.thenUnderlyingUseCaseNotExecuted(scenario.useCaseMock)
  })
})
