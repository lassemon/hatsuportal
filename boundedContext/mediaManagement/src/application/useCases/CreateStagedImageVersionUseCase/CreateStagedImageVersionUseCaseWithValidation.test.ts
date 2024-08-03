import { afterEach, describe, it, vi } from 'vitest'
import { CreateStagedImageVersionValidationScenario } from '../../../__test__/support/CreateStagedImageVersionValidationScenario'
import { AuthenticationError, AuthorizationError, InvalidInputError } from '@hatsuportal/platform'
import { EntityTypeEnum, ImageRoleEnum } from '@hatsuportal/common'
import { ICreateStagedImageVersionUseCaseOptions } from './CreateStagedImageVersionUseCase'

describe('CreateStagedImageVersionUseCaseWithValidation', () => {
  afterEach(() => vi.restoreAllMocks())

  const baseInput = (userId: string, ownerEntityId: string): ICreateStagedImageVersionUseCaseOptions => ({
    createdById: userId,
    createImageInput: {
      ownerEntityType: EntityTypeEnum.Story,
      ownerEntityId,
      role: ImageRoleEnum.Cover,
      mimeType: 'image/png',
      size: 100,
      base64: 'data:image/png;base64,AAA'
    },
    imageCreated: vi.fn()
  })

  it('should execute inner use case when all validations pass', async ({ unitFixture }) => {
    const scenario = await CreateStagedImageVersionValidationScenario.given()
      .withAdminUser()
      .whenExecutedWithInput(baseInput(unitFixture.sampleUserId, unitFixture.sampleImageId))

    scenario.thenUnderlyingUseCaseExecuted(scenario.useCaseMock)
  })

  it('should throw AuthenticationError when user not logged in', async ({ unitFixture }) => {
    const scenario = await CreateStagedImageVersionValidationScenario.given()
      .withoutLoggedInUser()
      .expectErrorOfType(AuthenticationError)
      .whenExecutedWithInput(baseInput(unitFixture.sampleUserId, unitFixture.sampleImageId))

    scenario.thenUnderlyingUseCaseNotExecuted(scenario.useCaseMock)
  })

  it('should throw AuthorizationError when authorization service denies', async ({ unitFixture }) => {
    const scenario = await CreateStagedImageVersionValidationScenario.given()
      .withAdminUser()
      .authorizationWillFail('denied')
      .expectErrorOfType(AuthorizationError)
      .whenExecutedWithInput(baseInput(unitFixture.sampleUserId, unitFixture.sampleImageId))

    scenario.thenUnderlyingUseCaseNotExecuted(scenario.useCaseMock)
  })

  it('should throw InvalidInputError for invalid mimeType', async ({ unitFixture }) => {
    const invalid = baseInput(unitFixture.sampleUserId, unitFixture.sampleImageId)
    invalid.createImageInput.mimeType = 'not-valid-mime-type'

    const scenario = await CreateStagedImageVersionValidationScenario.given()
      .withAdminUser()
      .expectErrorOfType(InvalidInputError)
      .whenExecutedWithInput(invalid)

    scenario.thenUnderlyingUseCaseNotExecuted(scenario.useCaseMock)
  })

  it('should throw InvalidInputError for invalid size', async ({ unitFixture }) => {
    const invalid = baseInput(unitFixture.sampleUserId, unitFixture.sampleImageId)
    invalid.createImageInput.size = 'large' as unknown as number

    const scenario = await CreateStagedImageVersionValidationScenario.given()
      .withAdminUser()
      .expectErrorOfType(InvalidInputError)
      .whenExecutedWithInput(invalid)

    scenario.thenUnderlyingUseCaseNotExecuted(scenario.useCaseMock)
  })

  it('should throw InvalidInputError for invalid base64', async ({ unitFixture }) => {
    const invalid = baseInput(unitFixture.sampleUserId, unitFixture.sampleImageId)
    invalid.createImageInput.base64 = 123 as unknown as string

    const scenario = await CreateStagedImageVersionValidationScenario.given()
      .withAdminUser()
      .expectErrorOfType(InvalidInputError)
      .whenExecutedWithInput(invalid)

    scenario.thenUnderlyingUseCaseNotExecuted(scenario.useCaseMock)
  })

  it('should throw InvalidInputError for invalid ownerEntityId', async ({ unitFixture }) => {
    const invalid = baseInput(unitFixture.sampleUserId, unitFixture.sampleImageId)
    invalid.createImageInput.ownerEntityId = 999 as unknown as string

    const scenario = await CreateStagedImageVersionValidationScenario.given()
      .withAdminUser()
      .expectErrorOfType(InvalidInputError)
      .whenExecutedWithInput(invalid)

    scenario.thenUnderlyingUseCaseNotExecuted(scenario.useCaseMock)
  })

  it('should throw InvalidInputError for invalid ownerEntityType', async ({ unitFixture }) => {
    const invalid = baseInput(unitFixture.sampleUserId, unitFixture.sampleImageId)
    invalid.createImageInput.ownerEntityType = 'NotAValidType' as unknown as EntityTypeEnum

    const scenario = await CreateStagedImageVersionValidationScenario.given()
      .withAdminUser()
      .expectErrorOfType(InvalidInputError)
      .whenExecutedWithInput(invalid)

    scenario.thenUnderlyingUseCaseNotExecuted(scenario.useCaseMock)
  })

  it('should throw InvalidInputError for invalid role', async ({ unitFixture }) => {
    const invalid = baseInput(unitFixture.sampleUserId, unitFixture.sampleImageId)
    invalid.createImageInput.role = 'NotAValidRole' as unknown as ImageRoleEnum

    const scenario = await CreateStagedImageVersionValidationScenario.given()
      .withAdminUser()
      .expectErrorOfType(InvalidInputError)
      .whenExecutedWithInput(invalid)

    scenario.thenUnderlyingUseCaseNotExecuted(scenario.useCaseMock)
  })
})
