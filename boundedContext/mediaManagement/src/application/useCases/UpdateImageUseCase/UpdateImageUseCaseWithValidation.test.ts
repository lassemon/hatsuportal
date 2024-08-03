import { DeepPartial } from '@hatsuportal/common'
import { afterEach, describe, it, vi } from 'vitest'
import { UpdateImageInputDTO } from '../../dtos'
import { UpdateImageValidationScenario } from '../../../__test__/support/UpdateImageValidationScenario'
import { AuthenticationError, NotFoundError, AuthorizationError, InvalidInputError } from '@hatsuportal/platform'
import { IUpdateImageUseCaseOptions } from './UpdateImageUseCase'

describe('UpdateImageUseCaseWithValidation', () => {
  afterEach(() => vi.restoreAllMocks())

  const baseInput = (
    loggedId: string,
    imageId: string,
    customProps: DeepPartial<UpdateImageInputDTO> = {}
  ): IUpdateImageUseCaseOptions => ({
    updatedById: loggedId,
    updateImageInput: {
      id: imageId,
      mimeType: 'image/png',
      size: 200,
      base64: 'data:image/png;base64,BBB',
      ...customProps
    },
    imageUpdated: vi.fn(),
    updateConflict: vi.fn()
  })

  it('should execute inner use case when validations pass', async ({ unitFixture }) => {
    const scenario = await UpdateImageValidationScenario.given()
      .withExistingImage()
      .whenExecutedWithInput(baseInput(unitFixture.sampleUserId, unitFixture.imageDTOMock().id))

    scenario.thenUnderlyingUseCaseExecuted(scenario.useCaseMock)
  })

  it('should throw AuthenticationError when not logged in', async ({ unitFixture }) => {
    const scenario = await UpdateImageValidationScenario.given()
      .withoutLoggedInUser()
      .expectErrorOfType(AuthenticationError)
      .whenExecutedWithInput(baseInput(unitFixture.sampleUserId, unitFixture.imageDTOMock().id))

    scenario.thenUnderlyingUseCaseNotExecuted(scenario.useCaseMock)
  })

  it('should throw NotFoundError when image not found', async ({ unitFixture }) => {
    const scenario = await UpdateImageValidationScenario.given()
      .withoutExistingImage()
      .expectErrorOfType(NotFoundError)
      .whenExecutedWithInput(baseInput(unitFixture.sampleUserId, 'nonexistent-image-id-1234567890-asdfghjkl-zxcvbnm'))

    scenario.thenUnderlyingUseCaseNotExecuted(scenario.useCaseMock)
  })

  it('should throw AuthorizationError when authorization service denies', async ({ unitFixture }) => {
    const scenario = await UpdateImageValidationScenario.given()
      .withExistingImage()
      .authorizationWillFail('denied')
      .expectErrorOfType(AuthorizationError)
      .whenExecutedWithInput(baseInput(unitFixture.sampleUserId, unitFixture.imageDTOMock().id))

    scenario.thenUnderlyingUseCaseNotExecuted(scenario.useCaseMock)
  })

  it('should throw InvalidInputError for invalid mimeType', async ({ unitFixture }) => {
    const invalid = baseInput(unitFixture.sampleUserId, unitFixture.imageDTOMock().id, { mimeType: 'invalid' })

    const scenario = await UpdateImageValidationScenario.given()
      .withExistingImage()
      .expectErrorOfType(InvalidInputError)
      .whenExecutedWithInput(invalid)

    scenario.thenUnderlyingUseCaseNotExecuted(scenario.useCaseMock)
  })

  it('should throw InvalidInputError for invalid size', async ({ unitFixture }) => {
    const scenario = await UpdateImageValidationScenario.given()
      .withExistingImage()
      .expectErrorOfType(InvalidInputError)
      .whenExecutedWithInput(baseInput(unitFixture.sampleUserId, unitFixture.imageDTOMock().id, { size: 'large' as any }))

    scenario.thenUnderlyingUseCaseNotExecuted(scenario.useCaseMock)
  })

  it('should throw InvalidInputError for invalid base64', async ({ unitFixture }) => {
    const scenario = await UpdateImageValidationScenario.given()
      .withExistingImage()
      .expectErrorOfType(InvalidInputError)
      .whenExecutedWithInput(baseInput(unitFixture.sampleUserId, unitFixture.imageDTOMock().id, { base64: 12345 as any }))

    scenario.thenUnderlyingUseCaseNotExecuted(scenario.useCaseMock)
  })
})
