import { afterEach, describe, it, vi } from 'vitest'
import { CreateImageValidationScenario } from '../../../__test__/support/CreateImageValidationScenario'
import { AuthenticationError, AuthorizationError } from '@hatsuportal/platform'
import { EntityTypeEnum, ImageRoleEnum } from '@hatsuportal/common'
import { ICreateImageUseCaseOptions } from './CreateImageUseCase'
import { InvalidInputError } from '@hatsuportal/platform'

describe('CreateImageUseCaseWithValidation', () => {
  afterEach(() => vi.restoreAllMocks())

  const baseInput = (userId: string): ICreateImageUseCaseOptions => ({
    createdById: userId,
    createImageInput: {
      ownerEntityType: EntityTypeEnum.Story,
      ownerEntityId: 'owner-1-923ads323-agjgu-234234234-kghadsi',
      role: ImageRoleEnum.Cover,
      mimeType: 'image/png',
      size: 100,
      base64: 'data:image/png;base64,AAA'
    },
    imageCreated: vi.fn()
  })

  it('should execute inner use case when all validations pass', async ({ unitFixture }) => {
    const scenario = await CreateImageValidationScenario.given().withAdminUser().whenExecutedWithInput(baseInput(unitFixture.sampleUserId))

    scenario.thenUnderlyingUseCaseExecuted(scenario.useCaseMock)
  })

  it('should throw AuthenticationError when user not logged in', async ({ unitFixture }) => {
    const scenario = await CreateImageValidationScenario.given()
      .withoutLoggedInUser()
      .expectErrorOfType(AuthenticationError)
      .whenExecutedWithInput(baseInput(unitFixture.sampleUserId))

    scenario.thenUnderlyingUseCaseNotExecuted(scenario.useCaseMock)
  })

  it('should throw AuthorizationError when authorization service denies', async ({ unitFixture }) => {
    const scenario = await CreateImageValidationScenario.given()
      .withAdminUser()
      .authorizationWillFail('denied')
      .expectErrorOfType(AuthorizationError)
      .whenExecutedWithInput(baseInput(unitFixture.sampleUserId))

    scenario.thenUnderlyingUseCaseNotExecuted(scenario.useCaseMock)
  })

  it('should throw InvalidInputError for invalid mimeType', async ({ unitFixture }) => {
    const invalid = baseInput(unitFixture.sampleUserId)
    invalid.createImageInput.mimeType = 'not-valid-mime-type'

    const scenario = await CreateImageValidationScenario.given()
      .withAdminUser()
      .expectErrorOfType(InvalidInputError)
      .whenExecutedWithInput(invalid)

    scenario.thenUnderlyingUseCaseNotExecuted(scenario.useCaseMock)
  })

  it('should throw InvalidInputError for invalid size', async ({ unitFixture }) => {
    const invalid = baseInput(unitFixture.sampleUserId)
    invalid.createImageInput.size = 'large' as any // not a number

    const scenario = await CreateImageValidationScenario.given()
      .withAdminUser()
      .expectErrorOfType(InvalidInputError)
      .whenExecutedWithInput(invalid)

    scenario.thenUnderlyingUseCaseNotExecuted(scenario.useCaseMock)
  })

  it('should throw InvalidInputError for invalid base64', async ({ unitFixture }) => {
    const invalid = baseInput(unitFixture.sampleUserId)
    invalid.createImageInput.base64 = 123 as any // not a string

    const scenario = await CreateImageValidationScenario.given()
      .withAdminUser()
      .expectErrorOfType(InvalidInputError)
      .whenExecutedWithInput(invalid)

    scenario.thenUnderlyingUseCaseNotExecuted(scenario.useCaseMock)
  })

  it('should throw InvalidInputError for invalid ownerEntityId', async ({ unitFixture }) => {
    const invalid = baseInput(unitFixture.sampleUserId)
    invalid.createImageInput.ownerEntityId = 999 as any // not a string

    const scenario = await CreateImageValidationScenario.given()
      .withAdminUser()
      .expectErrorOfType(InvalidInputError)
      .whenExecutedWithInput(invalid)

    scenario.thenUnderlyingUseCaseNotExecuted(scenario.useCaseMock)
  })

  it('should throw InvalidInputError for invalid ownerEntityType', async ({ unitFixture }) => {
    const invalid = baseInput(unitFixture.sampleUserId)
    invalid.createImageInput.ownerEntityType = 'NotAValidType' as any // not a valid enum

    const scenario = await CreateImageValidationScenario.given()
      .withAdminUser()
      .expectErrorOfType(InvalidInputError)
      .whenExecutedWithInput(invalid)

    scenario.thenUnderlyingUseCaseNotExecuted(scenario.useCaseMock)
  })

  it('should throw InvalidInputError for invalid role', async ({ unitFixture }) => {
    const invalid = baseInput(unitFixture.sampleUserId)
    invalid.createImageInput.role = 'NotAValidRole' as any // not a valid enum

    const scenario = await CreateImageValidationScenario.given()
      .withAdminUser()
      .expectErrorOfType(InvalidInputError)
      .whenExecutedWithInput(invalid)

    scenario.thenUnderlyingUseCaseNotExecuted(scenario.useCaseMock)
  })
})
