import { afterEach, describe, it, vi } from 'vitest'
import { EntityTypeEnum } from '@hatsuportal/common'
import { AuthorizationError, AuthenticationError, InvalidInputError } from '@hatsuportal/common-bounded-context'
import { CreateImageValidationScenario } from '../../../../__test__/support/image/CreateImageValidationScenario'

describe('CreateImageUseCaseWithValidation', () => {
  afterEach(() => vi.restoreAllMocks())

  const baseInput = (userId: string) => ({
    loggedInUserId: userId,
    createImageData: {
      fileName: 'img.png',
      mimeType: 'image/png',
      size: 120,
      base64: 'data:image/png;base64,AAA',
      ownerEntityId: 'owner-1-923ads323-agjgu-234234234-kghadsi',
      ownerEntityType: EntityTypeEnum.Story
    }
  })

  it('should execute inner use case when all validations pass', async ({ unitFixture }) => {
    const scenario = await CreateImageValidationScenario.given()
      .withAdminUser()
      .whenExecutedWithInput(baseInput(unitFixture.userDTOMock().id))

    scenario.thenUnderlyingUseCaseExecuted(scenario.useCaseMock)
  })

  it('should throw AuthenticationError when user not logged in', async ({ unitFixture }) => {
    const scenario = await CreateImageValidationScenario.given()
      .withoutLoggedInUser()
      .expectErrorOfType(AuthenticationError)
      .whenExecutedWithInput(baseInput(unitFixture.userDTOMock().id))

    scenario.thenUnderlyingUseCaseNotExecuted(scenario.useCaseMock)
  })

  it('should throw AuthorizationError when authorization service denies', async ({ unitFixture }) => {
    const scenario = await CreateImageValidationScenario.given()
      .withAdminUser()
      .authorizationWillFail('denied')
      .expectErrorOfType(AuthorizationError)
      .whenExecutedWithInput(baseInput(unitFixture.userDTOMock().id))

    scenario.thenUnderlyingUseCaseNotExecuted(scenario.useCaseMock)
  })

  it('should throw InvalidInputError for invalid mimeType', async ({ unitFixture }) => {
    const invalid = baseInput(unitFixture.userDTOMock().id)
    invalid.createImageData.mimeType = 'not-valid-mime-type'

    const scenario = await CreateImageValidationScenario.given()
      .withAdminUser()
      .expectErrorOfType(InvalidInputError)
      .whenExecutedWithInput(invalid)

    scenario.thenUnderlyingUseCaseNotExecuted(scenario.useCaseMock)
  })

  it('should throw InvalidInputError for invalid fileName', async ({ unitFixture }) => {
    const invalid = baseInput(unitFixture.userDTOMock().id)
    invalid.createImageData.fileName = 12345 as any // not a string

    const scenario = await CreateImageValidationScenario.given()
      .withAdminUser()
      .expectErrorOfType(InvalidInputError)
      .whenExecutedWithInput(invalid)

    scenario.thenUnderlyingUseCaseNotExecuted(scenario.useCaseMock)
  })

  it('should throw InvalidInputError for invalid size', async ({ unitFixture }) => {
    const invalid = baseInput(unitFixture.userDTOMock().id)
    invalid.createImageData.size = 'large' as any // not a number

    const scenario = await CreateImageValidationScenario.given()
      .withAdminUser()
      .expectErrorOfType(InvalidInputError)
      .whenExecutedWithInput(invalid)

    scenario.thenUnderlyingUseCaseNotExecuted(scenario.useCaseMock)
  })

  it('should throw InvalidInputError for invalid base64', async ({ unitFixture }) => {
    const invalid = baseInput(unitFixture.userDTOMock().id)
    invalid.createImageData.base64 = 123 as any // not a string

    const scenario = await CreateImageValidationScenario.given()
      .withAdminUser()
      .expectErrorOfType(InvalidInputError)
      .whenExecutedWithInput(invalid)

    scenario.thenUnderlyingUseCaseNotExecuted(scenario.useCaseMock)
  })

  it('should throw InvalidInputError for invalid ownerEntityId', async ({ unitFixture }) => {
    const invalid = baseInput(unitFixture.userDTOMock().id)
    invalid.createImageData.ownerEntityId = 999 as any // not a string

    const scenario = await CreateImageValidationScenario.given()
      .withAdminUser()
      .expectErrorOfType(InvalidInputError)
      .whenExecutedWithInput(invalid)

    scenario.thenUnderlyingUseCaseNotExecuted(scenario.useCaseMock)
  })

  it('should throw InvalidInputError for invalid ownerEntityType', async ({ unitFixture }) => {
    const invalid = baseInput(unitFixture.userDTOMock().id)
    invalid.createImageData.ownerEntityType = 'NotAValidType' as any // not a valid enum

    const scenario = await CreateImageValidationScenario.given()
      .withAdminUser()
      .expectErrorOfType(InvalidInputError)
      .whenExecutedWithInput(invalid)

    scenario.thenUnderlyingUseCaseNotExecuted(scenario.useCaseMock)
  })
})
