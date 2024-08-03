import { afterEach, describe, it, vi } from 'vitest'
import { DeleteImageValidationScenario } from '../../../__test__/support/DeleteImageValidationScenario'
import { AuthenticationError, AuthorizationError, NotFoundError } from '@hatsuportal/platform'
import { IDeleteImageUseCaseOptions } from './DeleteImageUseCase'
import { InvalidImageIdError } from '../../../domain'

describe('DeleteImageUseCaseWithValidation', () => {
  afterEach(() => vi.restoreAllMocks())

  const baseInput = (userId: string, imageId: string): IDeleteImageUseCaseOptions => ({
    deletedById: userId,
    deleteImageInput: { imageId },
    imageDeleted: vi.fn()
  })

  it('should execute inner use case when all validations pass', async ({ unitFixture }) => {
    const scenario = await DeleteImageValidationScenario.given()
      .withAdminUser()
      .withExistingImage()
      .whenExecutedWithInput(baseInput(unitFixture.sampleUserId, unitFixture.sampleImageId))

    scenario.thenUnderlyingUseCaseExecuted(scenario.useCaseMock)
  })

  it('should throw AuthenticationError when user not logged in', async ({ unitFixture }) => {
    const scenario = await DeleteImageValidationScenario.given()
      .withoutLoggedInUser()
      .withExistingImage()
      .expectErrorOfType(AuthenticationError)
      .whenExecutedWithInput(baseInput(unitFixture.sampleUserId, unitFixture.sampleImageId))

    scenario.thenUnderlyingUseCaseNotExecuted(scenario.useCaseMock)
  })

  it('should throw NotFoundError when image not found', async ({ unitFixture }) => {
    const scenario = await DeleteImageValidationScenario.given()
      .withAdminUser()
      .withoutExistingImage()
      .expectErrorOfType(NotFoundError)
      .whenExecutedWithInput(baseInput(unitFixture.sampleUserId, unitFixture.sampleImageId))

    scenario.thenUnderlyingUseCaseNotExecuted(scenario.useCaseMock)
  })

  it('should throw AuthorizationError when authorization service denies', async ({ unitFixture }) => {
    const scenario = await DeleteImageValidationScenario.given()
      .withAdminUser()
      .withExistingImage()
      .authorizationWillFail('denied')
      .expectErrorOfType(AuthorizationError)
      .whenExecutedWithInput(baseInput(unitFixture.sampleUserId, unitFixture.sampleImageId))

    scenario.thenUnderlyingUseCaseNotExecuted(scenario.useCaseMock)
  })

  it('should throw InvalidImageIdError for invalid imageId', async ({ unitFixture }) => {
    const invalid = baseInput(unitFixture.sampleUserId, unitFixture.sampleImageId)
    invalid.deleteImageInput.imageId = 'not-a-valid-uuid'

    const scenario = await DeleteImageValidationScenario.given()
      .withAdminUser()
      .withExistingImage()
      .expectErrorOfType(InvalidImageIdError)
      .whenExecutedWithInput(invalid)

    scenario.thenUnderlyingUseCaseNotExecuted(scenario.useCaseMock)
  })
})
