import { describe, it, vi, afterEach } from 'vitest'
import { CreateUserValidationScenario } from '../../../../__test__/support/user/CreateUserValidationScenario'
import { AuthenticationError, AuthorizationError, InvalidInputError } from '@hatsuportal/platform'
import { DeepPartial, UserRoleEnum } from '@hatsuportal/common'
import { ICreateUserUseCaseOptions } from './CreateUserUseCase'
import { CreateUserInputDTO } from '../../../dtos'
import { UserRole } from '../../../../domain'

describe('CreateUserUseCaseWithValidation', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  const baseInput = (userId: string, customProps: DeepPartial<CreateUserInputDTO> = {}): ICreateUserUseCaseOptions => ({
    createdById: userId,
    createUserInput: {
      name: 'Test User',
      email: 'test@example.com',
      password: 'ValidPassword123',
      ...customProps,
      roles: customProps.roles?.map((role) => role as UserRoleEnum) || [UserRoleEnum.Viewer]
    },
    userCreated: vi.fn()
  })

  it('should successfully execute create user use case when all validations pass', async ({ unitFixture }) => {
    const scenario = await CreateUserValidationScenario.given()
      .withAdminUser()
      .whenExecutedWithInput(baseInput(unitFixture.userDTOMock().id))

    scenario.thenUnderlyingUseCaseExecuted(scenario.useCaseMock)
  })

  it('should handle user with multiple roles including admin', async ({ unitFixture }) => {
    const scenario = await CreateUserValidationScenario.given()
      .withoutLoggedInUser()
      .withUserRoles(new UserRole(UserRoleEnum.Admin), new UserRole(UserRoleEnum.Creator), new UserRole(UserRoleEnum.Viewer))
      .withActualAuthorizationService()
      .whenExecutedWithInput(baseInput(unitFixture.userDTOMock().id))

    scenario.thenUnderlyingUseCaseExecuted(scenario.useCaseMock)
  })

  it('should throw AuthorizationError if user does not have admin role', async ({ unitFixture }) => {
    const scenario = await CreateUserValidationScenario.given()
      .withoutLoggedInUser()
      .withUserRoles(new UserRole(UserRoleEnum.Viewer))
      .withActualAuthorizationService()
      .expectErrorOfType(AuthorizationError)
      .whenExecutedWithInput(baseInput(unitFixture.userDTOMock().id))

    scenario.thenUnderlyingUseCaseNotExecuted(scenario.useCaseMock)
  })

  it('should throw AuthenticationError if loggedInUser does not exist', async ({ unitFixture }) => {
    const scenario = await CreateUserValidationScenario.given()
      .withoutLoggedInUser()
      .expectErrorOfType(AuthenticationError)
      .whenExecutedWithInput(baseInput(unitFixture.userDTOMock().id))

    scenario.thenUnderlyingUseCaseNotExecuted(scenario.useCaseMock)
  })

  it('should throw AuthorizationError if user not allowed to create user', async ({ unitFixture }) => {
    const scenario = await CreateUserValidationScenario.given()
      .withAdminUser()
      .authorizationWillFail('not allowed')
      .expectErrorOfType(AuthorizationError)
      .whenExecutedWithInput(baseInput(unitFixture.userDTOMock().id))

    scenario.thenUnderlyingUseCaseNotExecuted(scenario.useCaseMock)
  })

  it('should throw InvalidInputError when roles contain an invalid value', async ({ unitFixture }) => {
    const scenario = await CreateUserValidationScenario.given()
      .withAdminUser()
      .expectErrorOfType(InvalidInputError)
      .whenExecutedWithInput(
        baseInput(unitFixture.userDTOMock().id, {
          name: 'Valid Name',
          email: 'valid@example.com',
          password: 'ValidPassword123',
          roles: ['invalid_role' as unknown as UserRoleEnum]
        })
      )

    scenario.thenUnderlyingUseCaseNotExecuted(scenario.useCaseMock)
  })

  it('should throw InvalidInputError when creationData.name is empty', async ({ unitFixture }) => {
    const scenario = await CreateUserValidationScenario.given()
      .withAdminUser()
      .expectErrorOfType(InvalidInputError)
      .whenExecutedWithInput(
        baseInput(unitFixture.userDTOMock().id, {
          name: '',
          email: 'valid@example.com',
          password: 'ValidPassword123',
          roles: [UserRoleEnum.Viewer]
        })
      )

    scenario.thenUnderlyingUseCaseNotExecuted(scenario.useCaseMock)
  })

  it('should throw InvalidInputError when creationData.email is invalid', async ({ unitFixture }) => {
    const scenario = await CreateUserValidationScenario.given()
      .withAdminUser()
      .expectErrorOfType(InvalidInputError)
      .whenExecutedWithInput(
        baseInput(unitFixture.userDTOMock().id, {
          name: 'Valid Name',
          email: 'not_an_email',
          password: 'ValidPassword123',
          roles: [UserRoleEnum.Viewer]
        })
      )

    scenario.thenUnderlyingUseCaseNotExecuted(scenario.useCaseMock)
  })

  it('should throw InvalidInputError when creationData.password is invalid', async ({ unitFixture }) => {
    const scenario = await CreateUserValidationScenario.given()
      .withAdminUser()
      .expectErrorOfType(InvalidInputError)
      .whenExecutedWithInput(
        baseInput(unitFixture.userDTOMock().id, {
          name: 'Valid Name',
          email: 'valid@example.com',
          password: 'short',
          roles: [UserRoleEnum.Viewer]
        })
      )

    scenario.thenUnderlyingUseCaseNotExecuted(scenario.useCaseMock)
  })
})
