import { describe, it, vi, afterEach } from 'vitest'
import { UserRoleEnum } from '@hatsuportal/common'
import { AuthorizationError, AuthenticationError, InvalidInputError } from '@hatsuportal/common-bounded-context'
import { CreateUserValidationScenario } from '../../../../__test__/support/user/CreateUserValidationScenario'

describe('CreateUserUseCaseWithValidation', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  const validInput = (userId: string) => ({
    loggedInUserId: userId,
    creationData: {
      name: 'Test User',
      email: 'test@example.com',
      password: 'ValidPassword123',
      roles: [UserRoleEnum.Viewer]
    }
  })

  it('should successfully execute create user use case when all validations pass', async ({ unitFixture }) => {
    const scenario = await CreateUserValidationScenario.given()
      .withAdminUser()
      .whenExecutedWithInput(validInput(unitFixture.userDTOMock().id))

    scenario.thenUnderlyingUseCaseExecuted(scenario.useCaseMock)
  })

  it('should handle user with multiple roles including admin', async ({ unitFixture }) => {
    const scenario = await CreateUserValidationScenario.given()
      .withoutLoggedInUser()
      .withUserRoles(UserRoleEnum.Admin, UserRoleEnum.Creator, UserRoleEnum.Viewer)
      .withActualAuthorizationService()
      .whenExecutedWithInput(validInput(unitFixture.userDTOMock().id))

    scenario.thenUnderlyingUseCaseExecuted(scenario.useCaseMock)
  })

  it('should throw AuthorizationError if user does not have admin role', async ({ unitFixture }) => {
    const scenario = await CreateUserValidationScenario.given()
      .withoutLoggedInUser()
      .withUserRoles(UserRoleEnum.Viewer)
      .withActualAuthorizationService()
      .expectErrorOfType(AuthorizationError)
      .whenExecutedWithInput(validInput(unitFixture.userDTOMock().id))

    scenario.thenUnderlyingUseCaseNotExecuted(scenario.useCaseMock)
  })

  it('should throw AuthenticationError if loggedInUser does not exist', async ({ unitFixture }) => {
    const scenario = await CreateUserValidationScenario.given()
      .withoutLoggedInUser()
      .expectErrorOfType(AuthenticationError)
      .whenExecutedWithInput(validInput(unitFixture.userDTOMock().id))

    scenario.thenUnderlyingUseCaseNotExecuted(scenario.useCaseMock)
  })

  it('should throw AuthorizationError if user not allowed to create user', async ({ unitFixture }) => {
    const scenario = await CreateUserValidationScenario.given()
      .withAdminUser()
      .authorizationWillFail('not allowed')
      .expectErrorOfType(AuthorizationError)
      .whenExecutedWithInput(validInput(unitFixture.userDTOMock().id))

    scenario.thenUnderlyingUseCaseNotExecuted(scenario.useCaseMock)
  })

  it('should throw InvalidInputError when roles contain an invalid value', async ({ unitFixture }) => {
    const scenario = await CreateUserValidationScenario.given()
      .withAdminUser()
      .expectErrorOfType(InvalidInputError)
      .whenExecutedWithInput({
        loggedInUserId: unitFixture.userDTOMock().id,
        creationData: {
          name: 'Valid Name',
          email: 'valid@example.com',
          password: 'ValidPassword123',
          roles: ['invalid_role' as unknown as UserRoleEnum]
        }
      })

    scenario.thenUnderlyingUseCaseNotExecuted(scenario.useCaseMock)
  })

  it('should throw InvalidInputError when creationData.name is empty', async ({ unitFixture }) => {
    const scenario = await CreateUserValidationScenario.given()
      .withAdminUser()
      .expectErrorOfType(InvalidInputError)
      .whenExecutedWithInput({
        loggedInUserId: unitFixture.userDTOMock().id,
        creationData: {
          name: '',
          email: 'valid@example.com',
          password: 'ValidPassword123',
          roles: [UserRoleEnum.Viewer]
        }
      })

    scenario.thenUnderlyingUseCaseNotExecuted(scenario.useCaseMock)
  })

  it('should throw InvalidInputError when creationData.email is invalid', async ({ unitFixture }) => {
    const scenario = await CreateUserValidationScenario.given()
      .withAdminUser()
      .expectErrorOfType(InvalidInputError)
      .whenExecutedWithInput({
        loggedInUserId: unitFixture.userDTOMock().id,
        creationData: {
          name: 'Valid Name',
          email: 'not_an_email',
          password: 'ValidPassword123',
          roles: [UserRoleEnum.Viewer]
        }
      })

    scenario.thenUnderlyingUseCaseNotExecuted(scenario.useCaseMock)
  })

  it('should throw InvalidInputError when creationData.password is invalid', async ({ unitFixture }) => {
    const scenario = await CreateUserValidationScenario.given()
      .withAdminUser()
      .expectErrorOfType(InvalidInputError)
      .whenExecutedWithInput({
        loggedInUserId: unitFixture.userDTOMock().id,
        creationData: {
          name: 'Valid Name',
          email: 'valid@example.com',
          password: 'short',
          roles: [UserRoleEnum.Viewer]
        }
      })

    scenario.thenUnderlyingUseCaseNotExecuted(scenario.useCaseMock)
  })
})
