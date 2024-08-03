import { afterEach, describe, it, vi } from 'vitest'
import { PromoteImageVersionValidationScenario } from '../../../__test__/support/PromoteImageVersionValidationScenario'
import { AuthenticationError, AuthorizationError, InvalidInputError, NotFoundError } from '@hatsuportal/platform'
import { IPromoteImageVersionUseCaseOptions } from './PromoteImageVersionUseCase'
import { InvalidImageIdError } from '../../../domain'

describe('PromoteImageVersionUseCaseWithValidation', () => {
  afterEach(() => vi.restoreAllMocks())

  const baseInput = (userId: string, imageId: string, stagedVersionId: string): IPromoteImageVersionUseCaseOptions => ({
    promotedById: userId,
    imageId,
    stagedVersionId,
    imagePromoted: vi.fn()
  })

  it('should execute inner use case when all validations pass', async ({ unitFixture }) => {
    const scenario = await PromoteImageVersionValidationScenario.given()
      .withAdminUser()
      .withExistingImage()
      .whenExecutedWithInput(baseInput(unitFixture.sampleUserId, unitFixture.sampleImageId, unitFixture.sampleImageVersionId))

    scenario.thenUnderlyingUseCaseExecuted(scenario.useCaseMock)
  })

  it('should throw AuthenticationError when user not logged in', async ({ unitFixture }) => {
    const scenario = await PromoteImageVersionValidationScenario.given()
      .withoutLoggedInUser()
      .withExistingImage()
      .expectErrorOfType(AuthenticationError)
      .whenExecutedWithInput(baseInput(unitFixture.sampleUserId, unitFixture.sampleImageId, unitFixture.sampleImageVersionId))

    scenario.thenUnderlyingUseCaseNotExecuted(scenario.useCaseMock)
  })

  it('should throw NotFoundError when image not found', async ({ unitFixture }) => {
    const scenario = await PromoteImageVersionValidationScenario.given()
      .withAdminUser()
      .withoutExistingImage()
      .expectErrorOfType(NotFoundError)
      .whenExecutedWithInput(baseInput(unitFixture.sampleUserId, unitFixture.sampleImageId, unitFixture.sampleImageVersionId))

    scenario.thenUnderlyingUseCaseNotExecuted(scenario.useCaseMock)
  })

  it('should throw AuthorizationError when authorization service denies', async ({ unitFixture }) => {
    const scenario = await PromoteImageVersionValidationScenario.given()
      .withAdminUser()
      .withExistingImage()
      .authorizationWillFail('denied')
      .expectErrorOfType(AuthorizationError)
      .whenExecutedWithInput(baseInput(unitFixture.sampleUserId, unitFixture.sampleImageId, unitFixture.sampleImageVersionId))

    scenario.thenUnderlyingUseCaseNotExecuted(scenario.useCaseMock)
  })

  it('should throw InvalidImageIdError for invalid imageId', async ({ unitFixture }) => {
    const invalid = baseInput(unitFixture.sampleUserId, unitFixture.sampleImageId, unitFixture.sampleImageVersionId)
    invalid.imageId = 'not-a-valid-uuid'

    const scenario = await PromoteImageVersionValidationScenario.given()
      .withAdminUser()
      .withExistingImage()
      .expectErrorOfType(InvalidImageIdError)
      .whenExecutedWithInput(invalid)

    scenario.thenUnderlyingUseCaseNotExecuted(scenario.useCaseMock)
  })

  it('should throw InvalidInputError for invalid stagedVersionId', async ({ unitFixture }) => {
    const invalid = baseInput(unitFixture.sampleUserId, unitFixture.sampleImageId, unitFixture.sampleImageVersionId)
    invalid.stagedVersionId = 999 as unknown as string

    const scenario = await PromoteImageVersionValidationScenario.given()
      .withAdminUser()
      .withExistingImage()
      .expectErrorOfType(InvalidInputError)
      .whenExecutedWithInput(invalid)

    scenario.thenUnderlyingUseCaseNotExecuted(scenario.useCaseMock)
  })
})
