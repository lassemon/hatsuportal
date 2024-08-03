import { afterEach, describe, it, vi } from 'vitest'
import { DeepPartial, EntityTypeEnum } from '@hatsuportal/common'
import { AuthenticationError, AuthorizationError, InvalidInputError, NotFoundError } from '@hatsuportal/common-bounded-context'
import { UpdateImageValidationScenario } from '../../../../__test__/support/image/UpdateImageValidationScenario'
import { UpdateImageInputDTO } from '@hatsuportal/common-bounded-context'

describe('UpdateImageUseCaseWithValidation', () => {
  afterEach(() => vi.restoreAllMocks())

  const baseInput = (loggedId: string, imageId: string, customProps: DeepPartial<UpdateImageInputDTO['updateImageData']> = {}): any => ({
    loggedInUserId: loggedId,
    updateImageData: {
      id: imageId,
      fileName: 'new.png',
      mimeType: 'image/png',
      size: 200,
      base64: 'data:image/png;base64,BBB',
      ownerEntityId: 'owner-123-asdfghjkl-zxcvbnm-qwerasdf-1234567890-asdfghjkl-zxcvbnm',
      ownerEntityType: EntityTypeEnum.Story,
      ...customProps
    }
  })

  it('should execute inner use case when validations pass', async ({ unitFixture }) => {
    const scenario = await UpdateImageValidationScenario.given()
      .withExistingImage()
      .whenExecutedWithInput(baseInput(unitFixture.userDTOMock().id, unitFixture.imageDTOMock().id))

    scenario.thenUnderlyingUseCaseExecuted(scenario.useCaseMock)
  })

  it('should throw AuthenticationError when not logged in', async ({ unitFixture }) => {
    const scenario = await UpdateImageValidationScenario.given()
      .withoutLoggedInUser()
      .expectErrorOfType(AuthenticationError)
      .whenExecutedWithInput(baseInput(unitFixture.userDTOMock().id, unitFixture.imageDTOMock().id))

    scenario.thenUnderlyingUseCaseNotExecuted(scenario.useCaseMock)
  })

  it('should throw NotFoundError when image not found', async ({ unitFixture }) => {
    const scenario = await UpdateImageValidationScenario.given()
      .withoutExistingImage()
      .expectErrorOfType(NotFoundError)
      .whenExecutedWithInput(baseInput(unitFixture.userDTOMock().id, 'nonexistent-image-id-1234567890-asdfghjkl-zxcvbnm'))

    scenario.thenUnderlyingUseCaseNotExecuted(scenario.useCaseMock)
  })

  it('should throw AuthorizationError when authorization service denies', async ({ unitFixture }) => {
    const scenario = await UpdateImageValidationScenario.given()
      .withExistingImage()
      .authorizationWillFail('denied')
      .expectErrorOfType(AuthorizationError)
      .whenExecutedWithInput(baseInput(unitFixture.userDTOMock().id, unitFixture.imageDTOMock().id))

    scenario.thenUnderlyingUseCaseNotExecuted(scenario.useCaseMock)
  })

  it('should throw InvalidInputError for invalid mimeType', async ({ unitFixture }) => {
    const invalid = baseInput(unitFixture.userDTOMock().id, unitFixture.imageDTOMock().id, { mimeType: 'invalid' })

    const scenario = await UpdateImageValidationScenario.given()
      .withExistingImage()
      .expectErrorOfType(InvalidInputError)
      .whenExecutedWithInput(invalid)

    scenario.thenUnderlyingUseCaseNotExecuted(scenario.useCaseMock)
  })

  it('should throw InvalidInputError for invalid fileName', async ({ unitFixture }) => {
    const scenario = await UpdateImageValidationScenario.given()
      .withExistingImage()
      .expectErrorOfType(InvalidInputError)
      .whenExecutedWithInput(baseInput(unitFixture.userDTOMock().id, unitFixture.imageDTOMock().id, { fileName: 12345 as any }))

    scenario.thenUnderlyingUseCaseNotExecuted(scenario.useCaseMock)
  })

  it('should throw InvalidInputError for invalid size', async ({ unitFixture }) => {
    const scenario = await UpdateImageValidationScenario.given()
      .withExistingImage()
      .expectErrorOfType(InvalidInputError)
      .whenExecutedWithInput(baseInput(unitFixture.userDTOMock().id, unitFixture.imageDTOMock().id, { size: 'large' as any }))

    scenario.thenUnderlyingUseCaseNotExecuted(scenario.useCaseMock)
  })

  it('should throw InvalidInputError for invalid base64', async ({ unitFixture }) => {
    const scenario = await UpdateImageValidationScenario.given()
      .withExistingImage()
      .expectErrorOfType(InvalidInputError)
      .whenExecutedWithInput(baseInput(unitFixture.userDTOMock().id, unitFixture.imageDTOMock().id, { base64: 12345 as any }))

    scenario.thenUnderlyingUseCaseNotExecuted(scenario.useCaseMock)
  })

  it('should throw InvalidInputError for invalid ownerEntityType', async ({ unitFixture }) => {
    const scenario = await UpdateImageValidationScenario.given()
      .withExistingImage()
      .expectErrorOfType(InvalidInputError)
      .whenExecutedWithInput(baseInput(unitFixture.userDTOMock().id, unitFixture.imageDTOMock().id, { ownerEntityType: 'invalid' as any }))

    scenario.thenUnderlyingUseCaseNotExecuted(scenario.useCaseMock)
  })

  it('should throw InvalidInputError for invalid ownerEntityId', async ({ unitFixture }) => {
    const scenario = await UpdateImageValidationScenario.given()
      .withExistingImage()
      .expectErrorOfType(InvalidInputError)
      .whenExecutedWithInput(baseInput(unitFixture.userDTOMock().id, unitFixture.imageDTOMock().id, { ownerEntityId: 'invalid' as any }))

    scenario.thenUnderlyingUseCaseNotExecuted(scenario.useCaseMock)
  })
})
