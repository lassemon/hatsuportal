import { describe, it, vi, afterEach } from 'vitest'
import { UserRoleEnum, VisibilityEnum } from '@hatsuportal/common'
import { AuthorizationError } from '@hatsuportal/common-bounded-context'
import { CreateStoryValidationScenario } from '../../../__test__/support/story/CreateStoryValidationScenario'

describe('CreateStoryUseCaseWithValidation', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should successfully execute create story use case when all validations pass', async ({ unitFixture }) => {
    const scenario = await CreateStoryValidationScenario.given()
      .withLoggedInUser()
      .withoutExistingStory()
      .whenExecutedWithInput({
        loggedInUserId: unitFixture.userDTOMock().id,
        createStoryData: {
          name: 'Test Story',
          description: 'Test Description',
          visibility: VisibilityEnum.Public,
          image: { mimeType: 'image/png', size: 1, base64: `data:image/png;base64,AAA` }
        }
      })

    scenario.thenUnderlyingUseCaseExecuted(scenario.useCaseMock)
  })

  it('should handle user with multiple roles including creator', async ({ unitFixture }) => {
    const scenario = await CreateStoryValidationScenario.given()
      .withoutLoggedInUser()
      .withUserRoles(UserRoleEnum.Creator, UserRoleEnum.Admin, UserRoleEnum.Viewer)
      .withActualAuthorizationService()
      .whenExecutedWithInput({
        loggedInUserId: unitFixture.userDTOMock().id,
        createStoryData: {
          name: 'Test Story',
          description: 'Test Description',
          visibility: VisibilityEnum.Public,
          image: { mimeType: 'image/png', size: 1, base64: `data:image/png;base64,AAA` }
        }
      })

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

  it('should throw AuthorizationError if user not allowed to create story', async ({ unitFixture }) => {
    const scenario = await CreateStoryValidationScenario.given()
      .withoutLoggedInUser()
      .authorizationWillFail('not allowed')
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
})
