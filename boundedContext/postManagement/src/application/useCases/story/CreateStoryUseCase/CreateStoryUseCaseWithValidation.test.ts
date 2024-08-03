import { describe, it, vi, afterEach } from 'vitest'
import { UserRoleEnum, VisibilityEnum, DeepPartial } from '@hatsuportal/common'
import { InvalidInputError, AuthorizationError } from '@hatsuportal/platform'
import { CreateStoryValidationScenario } from '../../../../__test__/support/story/CreateStoryValidationScenario'
import { CreateStoryInputDTO } from '../../../dtos'
import { ICreateStoryUseCaseOptions } from '../CreateStoryUseCase'

describe('CreateStoryUseCaseWithValidation', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  const baseInput = (userId: string, customProps: DeepPartial<CreateStoryInputDTO> = {}): ICreateStoryUseCaseOptions => ({
    createdById: userId,
    createStoryInput: {
      name: 'Test Story',
      description: 'Test Description',
      visibility: VisibilityEnum.Public,
      ...customProps,
      image: { mimeType: 'image/png', size: 1, base64: `data:image/png;base64,AAA`, ...customProps.image }
    },
    storyCreated: vi.fn()
  })

  it('should successfully execute create story use case when all validations pass', async ({ unitFixture }) => {
    const scenario = await CreateStoryValidationScenario.given()
      .withLoggedInUser()
      .withoutExistingStory()
      .whenExecutedWithInput(baseInput(unitFixture.sampleUserId))

    scenario.thenUnderlyingUseCaseExecuted(scenario.useCaseMock)
  })

  it('should handle user with multiple roles including creator', async ({ unitFixture }) => {
    const scenario = await CreateStoryValidationScenario.given()
      .withLoggedInUser()
      .withUserRoles(UserRoleEnum.Creator, UserRoleEnum.Admin, UserRoleEnum.Viewer)
      .withActualAuthorizationService()
      .whenExecutedWithInput(baseInput(unitFixture.sampleUserId))

    scenario.thenUnderlyingUseCaseExecuted(scenario.useCaseMock)
  })

  it('should throw AuthorizationError if user does not have creator role', async ({ unitFixture }) => {
    const scenario = await CreateStoryValidationScenario.given()
      .withLoggedInUser()
      .withUserRoles(UserRoleEnum.Viewer)
      .withActualAuthorizationService()
      .expectErrorOfType(AuthorizationError)
      .whenExecutedWithInput(
        baseInput(unitFixture.sampleUserId, {
          name: 'Test Story',
          description: 'Test Description',
          visibility: VisibilityEnum.Public,
          image: { mimeType: 'image/png', size: 1, base64: `data:image/png;base64,AAA` }
        })
      )

    scenario.thenUnderlyingUseCaseNotExecuted(scenario.useCaseMock)
  })

  it('should throw AuthorizationError if loggedInUser does not exist', async ({ unitFixture }) => {
    const scenario = await CreateStoryValidationScenario.given()
      .withoutLoggedInUser()
      .withoutExistingStory()
      .expectErrorOfType(AuthorizationError)
      .whenExecutedWithInput(baseInput(unitFixture.sampleUserId))

    scenario.thenUnderlyingUseCaseNotExecuted(scenario.useCaseMock)
  })

  it('should throw AuthorizationError if user not allowed to create story', async ({ unitFixture }) => {
    const scenario = await CreateStoryValidationScenario.given()
      .withLoggedInUser()
      .authorizationWillFail('not allowed')
      .expectErrorOfType(AuthorizationError)
      .whenExecutedWithInput(baseInput(unitFixture.sampleUserId))

    scenario.thenUnderlyingUseCaseNotExecuted(scenario.useCaseMock)
  })

  it('should throw InvalidInputError when createStoryData.visibility is invalid', async ({ unitFixture }) => {
    const scenario = await CreateStoryValidationScenario.given()
      .withLoggedInUser()
      .withoutExistingStory()
      .expectErrorOfType(InvalidInputError)
      .whenExecutedWithInput(baseInput(unitFixture.sampleUserId, { visibility: 'invalid_visibility' as unknown as VisibilityEnum }))

    scenario.thenUnderlyingUseCaseNotExecuted(scenario.useCaseMock)
  })

  it('should throw InvalidInputError when createStoryData.name is empty', async ({ unitFixture }) => {
    const scenario = await CreateStoryValidationScenario.given()
      .withLoggedInUser()
      .withoutExistingStory()
      .expectErrorOfType(InvalidInputError)
      .whenExecutedWithInput(baseInput(unitFixture.sampleUserId, { name: '', image: null }))

    scenario.thenUnderlyingUseCaseNotExecuted(scenario.useCaseMock)
  })

  it('should throw InvalidInputError when createStoryData.description is empty', async ({ unitFixture }) => {
    const scenario = await CreateStoryValidationScenario.given()
      .withLoggedInUser()
      .withoutExistingStory()
      .expectErrorOfType(InvalidInputError)
      .whenExecutedWithInput(baseInput(unitFixture.sampleUserId, { description: '   ', image: null }))

    scenario.thenUnderlyingUseCaseNotExecuted(scenario.useCaseMock)
  })

  it('should throw InvalidInputError when createStoryData.image.mimeType is invalid', async ({ unitFixture }) => {
    const scenario = await CreateStoryValidationScenario.given()
      .withLoggedInUser()
      .withoutExistingStory()
      .expectErrorOfType(InvalidInputError)
      .whenExecutedWithInput(baseInput(unitFixture.sampleUserId, { image: { mimeType: '' } }))

    scenario.thenUnderlyingUseCaseNotExecuted(scenario.useCaseMock)
  })

  it('should throw InvalidInputError when createStoryData.image.size is not positive', async ({ unitFixture }) => {
    const scenario = await CreateStoryValidationScenario.given()
      .withLoggedInUser()
      .withoutExistingStory()
      .expectErrorOfType(InvalidInputError)
      .whenExecutedWithInput(baseInput(unitFixture.sampleUserId, { image: { size: 0 } }))

    scenario.thenUnderlyingUseCaseNotExecuted(scenario.useCaseMock)
  })

  it('should throw InvalidInputError when createStoryData.image.base64 is invalid', async ({ unitFixture }) => {
    const scenario = await CreateStoryValidationScenario.given()
      .withLoggedInUser()
      .withoutExistingStory()
      .expectErrorOfType(InvalidInputError)
      .whenExecutedWithInput(baseInput(unitFixture.sampleUserId, { image: { base64: '' } }))

    scenario.thenUnderlyingUseCaseNotExecuted(scenario.useCaseMock)
  })
})
