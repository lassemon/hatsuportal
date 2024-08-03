import { describe, it, vi, afterEach } from 'vitest'
import { UserRoleEnum, VisibilityEnum, DeepPartial } from '@hatsuportal/common'
import { AuthorizationError, InvalidInputError } from '@hatsuportal/common-bounded-context'
import { CreateStoryValidationScenario } from '../../../../__test__/support/story/CreateStoryValidationScenario'
import { CreateStoryInputDTO } from '@hatsuportal/post-management'

describe('CreateStoryUseCaseWithValidation', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  const baseInput = (userId: string, customProps: DeepPartial<CreateStoryInputDTO> = {}): CreateStoryInputDTO => ({
    loggedInUserId: userId,
    createStoryData: {
      name: 'Test Story',
      description: 'Test Description',
      visibility: VisibilityEnum.Public,
      ...customProps.createStoryData,
      image: { mimeType: 'image/png', size: 1, base64: `data:image/png;base64,AAA`, ...customProps.createStoryData?.image }
    }
  })

  it('should successfully execute create story use case when all validations pass', async ({ unitFixture }) => {
    const scenario = await CreateStoryValidationScenario.given()
      .withLoggedInUser()
      .withoutExistingStory()
      .whenExecutedWithInput(baseInput(unitFixture.userDTOMock().id))

    scenario.thenUnderlyingUseCaseExecuted(scenario.useCaseMock)
  })

  it('should handle user with multiple roles including creator', async ({ unitFixture }) => {
    const scenario = await CreateStoryValidationScenario.given()
      .withoutLoggedInUser()
      .withUserRoles(UserRoleEnum.Creator, UserRoleEnum.Admin, UserRoleEnum.Viewer)
      .withActualAuthorizationService()
      .whenExecutedWithInput(baseInput(unitFixture.userDTOMock().id))

    scenario.thenUnderlyingUseCaseExecuted(scenario.useCaseMock)
  })

  it('should throw AuthorizationError if user does not have creator role', async ({ unitFixture }) => {
    const scenario = await CreateStoryValidationScenario.given()
      .withoutLoggedInUser()
      .withUserRoles(UserRoleEnum.Viewer)
      .withActualAuthorizationService()
      .expectErrorOfType(AuthorizationError)
      .whenExecutedWithInput({
        loggedInUserId: unitFixture.userDTOMock().id,
        createStoryData: {
          name: 'Test Story',
          description: 'Test Description',
          visibility: VisibilityEnum.Public,
          image: { mimeType: 'image/png', size: 1, base64: `data:image/png;base64,AAA` }
        }
      })

    scenario.thenUnderlyingUseCaseNotExecuted(scenario.useCaseMock)
  })

  it('should throw AuthorizationError if loggedInUser does not exist', async ({ unitFixture }) => {
    const scenario = await CreateStoryValidationScenario.given()
      .withoutLoggedInUser()
      .withoutExistingStory()
      .expectErrorOfType(AuthorizationError)
      .whenExecutedWithInput(baseInput(unitFixture.userDTOMock().id))

    scenario.thenUnderlyingUseCaseNotExecuted(scenario.useCaseMock)
  })

  it('should throw AuthorizationError if user not allowed to create story', async ({ unitFixture }) => {
    const scenario = await CreateStoryValidationScenario.given()
      .withoutLoggedInUser()
      .authorizationWillFail('not allowed')
      .expectErrorOfType(AuthorizationError)
      .whenExecutedWithInput(baseInput(unitFixture.userDTOMock().id))

    scenario.thenUnderlyingUseCaseNotExecuted(scenario.useCaseMock)
  })

  it('should throw InvalidInputError when createStoryData.visibility is invalid', async ({ unitFixture }) => {
    const scenario = await CreateStoryValidationScenario.given()
      .withLoggedInUser()
      .withoutExistingStory()
      .expectErrorOfType(InvalidInputError)
      .whenExecutedWithInput(
        baseInput(unitFixture.userDTOMock().id, { createStoryData: { visibility: 'invalid_visibility' as unknown as VisibilityEnum } })
      )

    scenario.thenUnderlyingUseCaseNotExecuted(scenario.useCaseMock)
  })

  it('should throw InvalidInputError when createStoryData.name is empty', async ({ unitFixture }) => {
    const scenario = await CreateStoryValidationScenario.given()
      .withLoggedInUser()
      .withoutExistingStory()
      .expectErrorOfType(InvalidInputError)
      .whenExecutedWithInput(baseInput(unitFixture.userDTOMock().id, { createStoryData: { name: '', image: null } }))

    scenario.thenUnderlyingUseCaseNotExecuted(scenario.useCaseMock)
  })

  it('should throw InvalidInputError when createStoryData.description is empty', async ({ unitFixture }) => {
    const scenario = await CreateStoryValidationScenario.given()
      .withLoggedInUser()
      .withoutExistingStory()
      .expectErrorOfType(InvalidInputError)
      .whenExecutedWithInput(baseInput(unitFixture.userDTOMock().id, { createStoryData: { description: '   ', image: null } }))

    scenario.thenUnderlyingUseCaseNotExecuted(scenario.useCaseMock)
  })

  it('should throw InvalidInputError when createStoryData.image.mimeType is invalid', async ({ unitFixture }) => {
    const scenario = await CreateStoryValidationScenario.given()
      .withLoggedInUser()
      .withoutExistingStory()
      .expectErrorOfType(InvalidInputError)
      .whenExecutedWithInput(baseInput(unitFixture.userDTOMock().id, { createStoryData: { image: { mimeType: 'not-valid-mime-type' } } }))

    scenario.thenUnderlyingUseCaseNotExecuted(scenario.useCaseMock)
  })

  it('should throw InvalidInputError when createStoryData.image.size is not positive', async ({ unitFixture }) => {
    const scenario = await CreateStoryValidationScenario.given()
      .withLoggedInUser()
      .withoutExistingStory()
      .expectErrorOfType(InvalidInputError)
      .whenExecutedWithInput(baseInput(unitFixture.userDTOMock().id, { createStoryData: { image: { size: 0 } } }))

    scenario.thenUnderlyingUseCaseNotExecuted(scenario.useCaseMock)
  })

  it('should throw InvalidInputError when createStoryData.image.base64 is invalid', async ({ unitFixture }) => {
    const scenario = await CreateStoryValidationScenario.given()
      .withLoggedInUser()
      .withoutExistingStory()
      .expectErrorOfType(InvalidInputError)
      .whenExecutedWithInput(baseInput(unitFixture.userDTOMock().id, { createStoryData: { image: { base64: 'not_base64' } } }))

    scenario.thenUnderlyingUseCaseNotExecuted(scenario.useCaseMock)
  })
})
