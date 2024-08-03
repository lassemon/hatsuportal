import { describe, it, vi, afterEach } from 'vitest'
import { UserRoleEnum } from '@hatsuportal/common'
import { AuthorizationError, InvalidInputError } from '@hatsuportal/platform'
import { AddCommentTargetKind } from '../../../dtos'
import { AddCommentValidationScenario } from '../../../../__test__/support/comment/AddCommentValidationScenario'
import { IAddCommentUseCaseOptions } from '../AddCommentUseCase'
import { CommentId, PostId } from '../../../../domain'

describe('AddCommentUseCaseWithValidation', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  const baseInput = (unitFixture: typeof import('../../../../__test__/testFactory')): IAddCommentUseCaseOptions => ({
    addCommentInput: {
      postId: unitFixture.sampleStoryId,
      body: 'A new comment.',
      authorId: unitFixture.sampleUserId,
      target: { kind: AddCommentTargetKind.TopLevel, postId: unitFixture.sampleStoryId }
    },
    commentCreated: vi.fn()
  })

  const replyInput = (unitFixture: typeof import('../../../../__test__/testFactory')): IAddCommentUseCaseOptions => ({
    addCommentInput: {
      postId: unitFixture.sampleStoryId,
      body: 'A reply comment.',
      authorId: unitFixture.sampleUserId,
      target: { kind: AddCommentTargetKind.Reply, parentCommentId: unitFixture.sampleParentCommentId }
    },
    commentCreated: vi.fn()
  })

  it('should successfully execute add comment use case when all validations pass', async ({ unitFixture }) => {
    const scenario = await AddCommentValidationScenario.given()
      .withLoggedInUser()
      .withExistingPost()
      .whenExecutedWithInput(baseInput(unitFixture))

    scenario.thenUnderlyingUseCaseExecuted(scenario.useCaseMock)
  })

  it('should throw AuthorizationError if loggedInUser does not exist', async ({ unitFixture }) => {
    const scenario = await AddCommentValidationScenario.given()
      .withoutLoggedInUser()
      .withExistingPost()
      .expectErrorOfType(AuthorizationError)
      .whenExecutedWithInput(baseInput(unitFixture))

    scenario.thenUnderlyingUseCaseNotExecuted(scenario.useCaseMock)
  })

  it('should throw AuthorizationError if post does not exist', async ({ unitFixture }) => {
    const scenario = await AddCommentValidationScenario.given()
      .withLoggedInUser()
      .withoutExistingPost()
      .expectErrorOfType(AuthorizationError)
      .whenExecutedWithInput(baseInput(unitFixture))

    scenario.thenUnderlyingUseCaseNotExecuted(scenario.useCaseMock)
  })

  it('should throw AuthorizationError if user is not allowed to add comment', async ({ unitFixture }) => {
    const scenario = await AddCommentValidationScenario.given()
      .withLoggedInUser()
      .withExistingPost()
      .authorizationWillFail('Forbidden')
      .expectErrorOfType(AuthorizationError)
      .whenExecutedWithInput(baseInput(unitFixture))

    scenario.thenUnderlyingUseCaseNotExecuted(scenario.useCaseMock)
  })

  it('allows add by any active user via real ABAC', async ({ unitFixture }) => {
    const scenario = await AddCommentValidationScenario.given()
      .withLoggedInUser(unitFixture.userReadModelDTOMock({ roles: [UserRoleEnum.Viewer] }))
      .withExistingPost()
      .withActualAuthorizationService()
      .whenExecutedWithInput(baseInput(unitFixture))

    scenario.thenUnderlyingUseCaseExecuted(scenario.useCaseMock)
  })

  it('denies add by inactive user via real ABAC', async ({ unitFixture }) => {
    const scenario = await AddCommentValidationScenario.given()
      .withInactiveUser()
      .withExistingPost()
      .withActualAuthorizationService()
      .expectErrorOfType(AuthorizationError)
      .whenExecutedWithInput(baseInput(unitFixture))

    scenario.thenUnderlyingUseCaseNotExecuted(scenario.useCaseMock)
  })

  it('should throw InvalidInputError when postId is invalid', async ({ unitFixture }) => {
    const scenario = await AddCommentValidationScenario.given()
      .withLoggedInUser()
      .withExistingPost()
      .expectErrorOfType(InvalidInputError)
      .whenExecutedWithInput({
        ...baseInput(unitFixture),
        addCommentInput: {
          ...baseInput(unitFixture).addCommentInput,
          postId: 'invalid-id',
          target: { kind: AddCommentTargetKind.TopLevel, postId: 'invalid-id' }
        }
      })

    scenario.thenUnderlyingUseCaseNotExecuted(scenario.useCaseMock)
  })

  it('should throw InvalidInputError when body is empty', async ({ unitFixture }) => {
    const scenario = await AddCommentValidationScenario.given()
      .withLoggedInUser()
      .withExistingPost()
      .expectErrorOfType(InvalidInputError)
      .whenExecutedWithInput({
        ...baseInput(unitFixture),
        addCommentInput: {
          ...baseInput(unitFixture).addCommentInput,
          body: '   '
        }
      })

    scenario.thenUnderlyingUseCaseNotExecuted(scenario.useCaseMock)
  })

  it('allows reply by any active user via real ABAC', async ({ unitFixture }) => {
    const scenario = await AddCommentValidationScenario.given()
      .withLoggedInUser(unitFixture.userReadModelDTOMock({ roles: [UserRoleEnum.Viewer] }))
      .withExistingPost()
      .withParentComment()
      .withActualAuthorizationService()
      .whenExecutedWithInput(replyInput(unitFixture))

    scenario.thenUnderlyingUseCaseExecuted(scenario.useCaseMock)
  })

  it('denies reply when parent comment does not exist', async ({ unitFixture }) => {
    const scenario = await AddCommentValidationScenario.given()
      .withLoggedInUser()
      .withExistingPost()
      .withoutExistingComment()
      .expectErrorOfType(AuthorizationError)
      .whenExecutedWithInput(replyInput(unitFixture))

    scenario.thenUnderlyingUseCaseNotExecuted(scenario.useCaseMock)
  })

  it('denies reply when parent comment is deleted', async ({ unitFixture }) => {
    const scenario = await AddCommentValidationScenario.given()
      .withLoggedInUser()
      .withExistingPost()
      .withDeletedComment(
        unitFixture.commentMock({ id: new CommentId(unitFixture.sampleParentCommentId), isDeleted: true, body: null })
      )
      .expectErrorOfType(AuthorizationError)
      .whenExecutedWithInput(replyInput(unitFixture))

    scenario.thenUnderlyingUseCaseNotExecuted(scenario.useCaseMock)
  })

  it('denies reply when parent comment belongs to a different post', async ({ unitFixture }) => {
    const scenario = await AddCommentValidationScenario.given()
      .withLoggedInUser()
      .withExistingPost()
      .withParentComment(
        unitFixture.commentMock({
          id: new CommentId(unitFixture.sampleParentCommentId),
          postId: new PostId(unitFixture.sampleRecipeId)
        })
      )
      .expectErrorOfType(AuthorizationError)
      .whenExecutedWithInput(replyInput(unitFixture))

    scenario.thenUnderlyingUseCaseNotExecuted(scenario.useCaseMock)
  })
})
